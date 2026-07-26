// Route: /(auth)/register — thin wrapper, renders the register role-select screen.
import { RegisterScreen } from "@features/auth/screens/RegisterScreen";

export default function RegisterRoute() {
  return <RegisterScreen />;
}
