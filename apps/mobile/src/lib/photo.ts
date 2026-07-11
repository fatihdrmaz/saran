/**
 * Yara fotoğrafı seçme + yükleme yardımcıları.
 * Ekranlar `pickWoundPhoto` ile kamera/galeriden GERÇEK görsel seçtirir;
 * `uploadWoundPhoto` seçilen görseli Supabase Storage'a yükleyip yolu döner.
 */
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { WOUND_PHOTOS_BUCKET, woundPhotoPath } from "@saran/supabase";
import { supabase } from "./supabase";

/** Seçilen yara fotoğrafı (yerel URI + ad + MIME). */
export interface PickedPhoto {
  uri: string;
  fileName: string;
  mimeType: string | null;
}

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  quality: 0.7,
  allowsEditing: false,
};

/** ImagePicker sonucunu PickedPhoto'ya çevirir; iptalde null. */
function toPickedPhoto(result: ImagePicker.ImagePickerResult): PickedPhoto | null {
  if (result.canceled) return null;
  const asset = result.assets?.[0];
  if (!asset) return null;
  return {
    uri: asset.uri,
    fileName: asset.fileName ?? `foto-${Date.now()}.jpg`,
    mimeType: asset.mimeType ?? null,
  };
}

async function pickFromCamera(): Promise<PickedPhoto | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      "Kamera izni gerekli",
      "Yara fotoğrafı çekebilmek için Ayarlar'dan kamera iznini açmanız gerekir.",
    );
    return null;
  }
  const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
  return toPickedPhoto(result);
}

async function pickFromLibrary(): Promise<PickedPhoto | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      "Galeri izni gerekli",
      "Fotoğraf seçebilmek için Ayarlar'dan galeri (fotoğraflar) iznini açmanız gerekir.",
    );
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
  return toPickedPhoto(result);
}

/**
 * Kullanıcıya "Kamera / Galeriden seç / Vazgeç" sorup seçilen kaynaktan
 * gerçek bir görsel döndürür. İptal veya izin reddi durumunda null.
 */
export function pickWoundPhoto(): Promise<PickedPhoto | null> {
  return new Promise((resolve) => {
    Alert.alert(
      "Yara fotoğrafı",
      "Fotoğrafı nereden eklemek istersiniz?",
      [
        {
          text: "Kamera",
          onPress: () => {
            pickFromCamera().then(resolve, () => resolve(null));
          },
        },
        {
          text: "Galeriden seç",
          onPress: () => {
            pickFromLibrary().then(resolve, () => resolve(null));
          },
        },
        { text: "Vazgeç", style: "cancel", onPress: () => resolve(null) },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}

/** Dosya adını storage için güvenli hale getirir (a-z0-9._- dışını temizler). */
function sanitizeFileName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  return cleaned || "foto.jpg";
}

/**
 * Seçilen fotoğrafı Supabase Storage'daki yara klasörüne yükler ve
 * kaydedilecek `image_path` değerini döner.
 */
export async function uploadWoundPhoto(
  woundId: string,
  photo: PickedPhoto,
): Promise<string> {
  const response = await fetch(photo.uri);
  const body = await response.arrayBuffer();

  const imagePath = woundPhotoPath(
    woundId,
    `${Date.now()}-${sanitizeFileName(photo.fileName)}`,
  );

  const { error } = await supabase.storage
    .from(WOUND_PHOTOS_BUCKET)
    .upload(imagePath, body, {
      contentType: photo.mimeType ?? "image/jpeg",
      upsert: true,
    });

  if (error) throw error;
  return imagePath;
}
