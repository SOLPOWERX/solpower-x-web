import { permanentRedirect } from "next/navigation";

/** La portada de prueba ya es la principal: /nueva lleva a "/". */
export default function Nueva() {
  permanentRedirect("/");
}
