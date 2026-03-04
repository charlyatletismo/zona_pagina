import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/themeProvider";
import { useState } from "react";


export function ThemeModeToggle({
  className,
}: {
  className?: string
}) {
  const { setTheme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("vite-ui-theme") as "light" | "dark" || "light")

  function toggleTheme() {
    // console.log("Current theme:", currentTheme)
    if (currentTheme === "light") {
      setTheme("dark")
      setCurrentTheme("dark")
    } else {
      setTheme("light")
      setCurrentTheme("light")
    }
    // console.log("Now theme:", currentTheme)
  }

  return (
    <button
      onClick={toggleTheme}
      className={className}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 text-black" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}