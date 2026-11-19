import { View } from "react-native"
import { useAppTheme } from "@/lib/theme"

export const Bar = ({ progress, done }: { progress: number; done: boolean }) => {
  const { colors } = useAppTheme()
  return (
    <View className="h-2 min-w-12 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: colors.surfaceVariant }}>
      <View className="h-full rounded-full" style={{ width: `${Math.min(progress, 1) * 100}%`, backgroundColor: done ? colors.success : colors.primary }} />
    </View>
  )
}
