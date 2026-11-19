import { useState } from "react"
import { Pressable, View } from "react-native"
import { Menu, TextInput } from "react-native-paper"

type Props<T extends string | number> = {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  className?: string
}

export const Select = <T extends string | number>({ label, value, options, onChange, className }: Props<T>) => {
  const [open, setOpen] = useState(false)
  return (
    <View className={className}>
      <Menu
        visible={open}
        onDismiss={() => setOpen(false)}
        anchorPosition="bottom"
        anchor={
          <Pressable onPress={() => setOpen(true)}>
            <View pointerEvents="none">
              <TextInput
                mode="outlined"
                label={label}
                value={options.find(option => option.value == value)?.label ?? String(value)}
                editable={false}
                right={<TextInput.Icon icon="menu-down" />}
              />
            </View>
          </Pressable>
        }
      >
        {options.map(option => (
          <Menu.Item
            key={option.value}
            title={option.label}
            onPress={() => {
              onChange(option.value)
              setOpen(false)
            }}
          />
        ))}
      </Menu>
    </View>
  )
}
