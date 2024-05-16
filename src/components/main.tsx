import { ComponentProps } from "react";

interface MainProps extends ComponentProps<'main'> { }

export function Main(props: MainProps) {
  return (
    <main {...props} className="max-w-6xl mx-auto py-10 px-4 space-y-5" />
  )
}