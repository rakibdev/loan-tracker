import { useState } from "react"
import { useTranslation } from "react-i18next"
import { IconButton, Menu } from "react-native-paper"
import { Confirm } from "./Confirm"

export const MoreMenu = ({ message, onDelete }: { message: string; onDelete: () => void }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  return (
    <>
      <Menu visible={open} onDismiss={() => setOpen(false)} anchor={<IconButton icon="dots-vertical" onPress={() => setOpen(true)} />}>
        <Menu.Item
          leadingIcon="delete-outline"
          title={t("delete")}
          onPress={() => {
            setOpen(false)
            setConfirm(true)
          }}
        />
      </Menu>
      <Confirm visible={confirm} message={message} action={t("delete")} onDismiss={() => setConfirm(false)} onConfirm={onDelete} />
    </>
  )
}
