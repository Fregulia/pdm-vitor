import { auth } from "@/services/firebase";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const storage = getStorage();

// PROCESSA E SALVA A IMAGEM - FOTO DE PERFIL
async function processAndUploadImage(uri: string): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("NOT_AUTHENTICATED");

  // REDIMENSIONA E COMPRIME A IMAGEM
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 150, height: 150 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.PNG }
  );

  // CONVERTE PRA BLOB E SALVA NO STORAGE COM NOME ÚNICO
  const response = await fetch(manipulated.uri);
  const blob = await response.blob();

  const storageRef = ref(storage, `imagens/perfil-usuario-${user.uid}.png`);
  await uploadBytes(storageRef, blob);

  // RETORNA A URL DA IMAGEM SALVA
  return await getDownloadURL(storageRef);
}

// ESCOLHER FOTO DA GALERIA E ENVIAR COMO FOTO DE PERFIL
export async function pickAndUploadProfilePhoto(): Promise<string | null> {
  // PEDE PERMISSÃO PRA ACESSAR A GALERIA
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permissão de acesso à galeria negada");
  }

  // ABRE A GALERIA PRA ESCOLHER UMA IMAGEM
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images" as any,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) return null;
  return await processAndUploadImage(result.assets[0].uri);
}

// TIRAR FOTO COM A CÂMERA E ENVIAR COMO FOTO DE PERFIL
export async function takeAndUploadProfilePhoto(): Promise<string | null> {
  // PEDE PERMISSÃO PRA ACESSAR A CÂMERA
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permissão de acesso à câmera negada");
  }

  // ABRE A CÂMERA PRA TIRAR UMA FOTO
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) return null;
  return await processAndUploadImage(result.assets[0].uri);
}

// APAGAR FOTO DE PERFIL
export async function deleteProfilePhoto(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("NOT_AUTHENTICATED");

  // BUSCA PELO NOME ÚNICO E APAGA
  const storageRef = ref(storage, `imagens/perfil-usuario-${user.uid}.png`);
  try {
    await deleteObject(storageRef);
  } catch (error: any) {
    if (error.code !== "storage/object-not-found") {
      throw error;
    }
  }
}
