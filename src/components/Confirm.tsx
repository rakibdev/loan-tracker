import { useTranslation } from "react-i18next"
import { Button, Dialog, Portal, Text } from "react-native-paper"

type Props = { visible: boolean; message: string; action: string; onConfirm: () => void; onDismiss: () => void }

export const Confirm = ({ visible, message, action, onConfirm, onDismiss }: Props) => {
  const { t } = useTranslation()
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Content>
          <Text variant="bodyLarge">{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t("cancel")}</Button>
          <Button onPress={onConfirm}>{action}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}
