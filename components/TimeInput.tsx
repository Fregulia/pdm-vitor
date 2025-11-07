import { ThemedButton } from "@/components/ThemedButton";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

function parseTime(value?: string): Date {
  const d = new Date();
  if (!value) return new Date(d.setHours(9, 0, 0, 0));
  const [h, m] = value.split(":").map((v) => parseInt(v, 10));
  if (Number.isFinite(h) && Number.isFinite(m)) {
    return new Date(d.setHours(h, m, 0, 0));
  }
  return new Date(d.setHours(9, 0, 0, 0));
}

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (val: string) => void;
}) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const colorScheme = useColorScheme() ?? "light";
  const date = useMemo(() => parseTime(value), [value]);

  const openPicker = () => {
    setTempDate(date);
    setShow(true);
  };

  const onChangeInner = (event: DateTimePickerEvent, selected?: Date) => {
    // Don't commit yet; just update temporary date
    if (event.type === "dismissed") return; // keep current temp
    if (selected) setTempDate(selected);
  };

  const cancel = () => {
    setShow(false);
    setTempDate(null);
  };

  const save = () => {
    const d = tempDate ?? date;
    onChange(formatTime(d));
    setShow(false);
    setTempDate(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          color: Colors[colorScheme].secondaryText,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <Pressable
        onPress={openPicker}
        style={{
          height: 50,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: Colors[colorScheme].tint,
          paddingHorizontal: 12,
          justifyContent: "center",
          backgroundColor: Colors[colorScheme].card,
        }}
      >
        <Text style={{ color: Colors[colorScheme].text, fontSize: 16 }}>
          {value || formatTime(date)}
        </Text>
      </Pressable>
      <Modal
        visible={show}
        transparent
        animationType="fade"
        onRequestClose={cancel}
      >
        <Pressable
          onPress={cancel}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              width: 300,
              borderRadius: 12,
              padding: 16,
              backgroundColor: Colors[colorScheme].background,
            }}
          >
            <Text
              style={{
                color: Colors[colorScheme].text,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              {label}
            </Text>
            <DateTimePicker
              value={tempDate ?? date}
              mode="time"
              display="spinner"
              is24Hour={true}
              onChange={onChangeInner}
            />
            <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
              <ThemedButton
                title="Cancelar"
                onPress={cancel}
                variant="secondary"
                style={{ flex: 1 }}
              />
              <ThemedButton title="Salvar" onPress={save} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
