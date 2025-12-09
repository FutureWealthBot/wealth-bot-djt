import "styles/tailwind.css"
import * as RadixTooltip from "@radix-ui/react-tooltip"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RadixTooltip.Provider>{children}</RadixTooltip.Provider>
      </body>
    </html>
  )
}
