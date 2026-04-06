import { ClientLayoutWrapper } from "@/components/client/ClientLayoutWrapper"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
}
