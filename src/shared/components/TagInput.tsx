// TagInput — free-text tag list: existing tags render as removable chips, an "add" chip
// reveals an input to type and commit a new one. Used by listing requirements and worker skills.
import { Check, Plus } from "phosphor-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Chip } from "@shared/components/Chip";
import { Input } from "@shared/components/Input";
import { useThemeColors } from "@shared/hooks/useThemeColors";

type TagInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  addLabel: string;
  placeholder?: string;
};

export function TagInput({ tags, onChange, addLabel, placeholder }: TagInputProps) {
  const colors = useThemeColors();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const commit = () => {
    const value = draft.trim();
    if (value) onChange([...tags, value]);
    setDraft("");
    setAdding(false);
  };

  return (
    <View className="gap-2">
      <View className="flex-row flex-wrap gap-2">
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            variant="active"
            leftIcon={<Check size={13} weight="bold" color={colors.onBrand} />}
            onPress={() => onChange(tags.filter((existing) => existing !== tag))}
          />
        ))}
        {!adding ? (
          <Chip
            label={addLabel}
            variant="neutral"
            leftIcon={<Plus size={13} weight="bold" color={colors.textMuted} />}
            onPress={() => setAdding(true)}
          />
        ) : null}
      </View>
      {adding ? (
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <Input
              value={draft}
              onChangeText={setDraft}
              placeholder={placeholder}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={commit}
            />
          </View>
          <Pressable
            onPress={commit}
            className="h-12 w-12 items-center justify-center rounded-input bg-brand"
          >
            <Check size={20} weight="bold" color={colors.onBrand} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
