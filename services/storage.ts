import { auth } from "@/services/firebase";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, getStorage, ref, uploadBytes, deleteObject } from "firebase/storage";

const storage = getStorage();

async function processAndUploadImage(uri: string): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("NOT_AUTHENTICATED");

  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 150, height: 150 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.PNG }
  );

  const response = await fetch(manipulated.uri);
  const blob = await response.blob();

  const storageRef = ref(storage, `imagens/perfil-usuario-${user.uid}.png`);
  await uploadBytes(storageRef, blob);

  return await getDownloadURL(storageRef);
}

export async function pickAndUploadProfilePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permissão de acesso à galeria negada");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images" as any,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) return null;
  return await processAndUploadImage(result.assets[0].uri);
}

export async function takeAndUploadProfilePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permissão de acesso à câmera negada");
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) return null;
  return await processAndUploadImage(result.assets[0].uri);
}

export async function deleteProfilePhoto(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("NOT_AUTHENTICATED");

  const storageRef = ref(storage, `imagens/perfil-usuario-${user.uid}.png`);
  try {
    await deleteObject(storageRef);
  } catch (error: any) {
    if (error.code !== "storage/object-not-found") {
      throw error;
    }
  }
}
