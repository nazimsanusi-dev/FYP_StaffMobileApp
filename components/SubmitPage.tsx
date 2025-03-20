// import React from 'react';
// import { View, Text, Button, Alert, StyleSheet } from 'react-native';

// const SubmitPage: React.FC = ({ navigation }: any) => {
//   const handleUploadPicture = () => {
//     Alert.alert("Update Soon.....");
//   };

//   const handleSubmitReport = () => {
//     Alert.alert(
//       "Confirmation",
//       "Are you sure you want to submit the report?",
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Ok",
//           onPress: () => navigation.navigate("Schedule"),
//         },
//       ],
//       { cancelable: true }
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Submit Page</Text>
//       <View style={styles.buttonContainer}>
//         <Button title="Upload Picture" onPress={handleUploadPicture} />
//         <Button title="Submit Report" onPress={handleSubmitReport} />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#f8f9fa",
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   buttonContainer: {
//     width: "80%",
//     justifyContent: "space-between",
//     flexDirection: "row",
//     marginTop: 20,
//   },
// });

// export default SubmitPage;

//********************************************************************************************************* */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, updateDoc,serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../constants/firebaseConfig";

const SubmitPage: React.FC = ({ route, navigation }: any) => {
  const { residentID, subDocID } = route.params;
  
  const [issue, setIssue] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [weight, setWeight] = useState<string>("");

  useEffect(() => {
    if (!residentID || !subDocID) {
      Alert.alert("Error", "Invalid parameters. Please try again.");
      navigation.goBack();
      return;
    }

    const fetchIssue = async () => {
      try {
        const docRef = doc(db, "residents", residentID, "reports", subDocID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setIssue(docSnap.data().issue || "No issue provided");
        } else {
          Alert.alert("Error", "No such document found!");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch issue.");
        console.error(error);
      }
    };

    fetchIssue();
  }, [residentID, subDocID]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleTakePicture = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!imageUri) return null;

    try {
      setUploading(true);
      const blob = await fetch(imageUri).then((res) => res.blob());
      const filename = `reports/${residentID}/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);

      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on("state_changed", (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Number(progress.toFixed(2)));
      });

      await uploadTask;
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      Alert.alert("Error", "Image upload failed.");
      console.error(error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!weight) {
      Alert.alert("Error", "Please enter the weight.");
      return;
    }

    const confirmSubmit = await new Promise((resolve) => {
      Alert.alert(
        "Confirmation",
        "Are you sure you want to submit the report?",
        [
          { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
          { text: "Submit", onPress: () => resolve(true) },
        ],
        { cancelable: true }
      );
    });

    if (!confirmSubmit) return;

    try {
      const imageUrl = await uploadImage();
      const docRef = doc(db, "residents", residentID, "reports", subDocID);

      await updateDoc(docRef, {
        weightwaste: weight,
        picafterpickup: imageUrl || "",
        status: "Success",
        date_collection: new Date().toISOString(),
      });

      Alert.alert("Success", "Report submitted successfully!", [
        {
          text: "OK",
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            }),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to submit report.");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Submit Page</Text>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
      {/* <Text style={styles.subText}>ID: {subDocID}</Text> */}
      {issue ? (
        <Text style={styles.subText}>{issue} - {subDocID.substring(0,5)}</Text>
      ) : (
        <Text>Loading...</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Enter Weight (KG)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />

      

      <View style={styles.imageContainer}>
        <TouchableOpacity style={styles.button} onPress={handleTakePicture}>
          <Text style={styles.buttonText}>Take Picture</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handlePickImage}>
          <Text style={styles.buttonText}>Upload Picture</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.uploadButton} onPress={handleSubmitReport}>
        <Text style={styles.uploadButtonText}>
          {uploading ? `Uploading: ${uploadProgress}%` : "Submit Report"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  header: { fontSize: 30, marginBottom: 20, fontWeight: "bold" },
  subText: { fontSize: 18, marginVertical: 10 ,marginBottom: 23 ,fontWeight: "bold",color: "#6200ee"},
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 10, fontSize: 16, marginBottom: 20, width: "100%",alignItems: "center" },
  imageContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  button: { flex: 1, backgroundColor: "#6200ee", padding: 10, marginHorizontal: 5, borderRadius: 10 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  imagePreview: { width: "100%", height: 200, borderRadius: 10, marginVertical: 10 },
  uploadButton: { backgroundColor: "#2196f3", padding: 15, borderRadius: 10, alignItems: "center", width:"100%" },
  uploadButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default SubmitPage;
