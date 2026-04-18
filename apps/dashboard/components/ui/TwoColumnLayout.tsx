interface TwoColumnLayoutProps {
  left: React.ReactNode
  right: React.ReactNode
  leftWidth?: "narrow" | "balanced"
}

export function TwoColumnLayout({
  left,
  right,
  leftWidth = "narrow",
}: TwoColumnLayoutProps) {
  const leftCls =
    leftWidth === "narrow" ? "lg:w-[360px]" : "lg:w-[40%]"

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
      <div className={`w-full shrink-0 ${leftCls}`}>{left}</div>
      <div className="min-w-0 flex-1">{right}</div>
    </div>
  )
}
