import { useTheme } from "next-themes"
import { CSSProperties } from "react"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'neomorph-raised border-0 backdrop-blur-sm',
          description: 'text-foreground opacity-90',
          closeButton: 'neomorph-flat border-0 !bg-background hover:!bg-accent !opacity-100 shadow-sm',
        },
      }}
      style={
        {
          "--normal-bg": "hsl(var(--background))",
          "--normal-text": "hsl(var(--foreground))",
          "--normal-border": "transparent",
        } as CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
