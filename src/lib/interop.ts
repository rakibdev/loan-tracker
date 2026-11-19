import { cssInterop } from "nativewind"
import { Card, Divider, FAB, Searchbar, Text, TextInput, TouchableRipple } from "react-native-paper"

for (const component of [Card, Card.Content, Divider, FAB, Searchbar, Text, TextInput, TouchableRipple]) cssInterop(component, { className: "style" })
