const statusStyles: Record<string, string> = {
  Iniciando: "border-[rgba(214,181,65,0.28)] bg-[rgba(83,79,66,0.5)] text-[#ede2b8]",
  "Em evolucao": "border-[rgba(126,169,255,0.36)] bg-[rgba(126,169,255,0.12)] text-[#bfd4ff]",
  "Bom desempenho": "border-[rgba(82,200,140,0.38)] bg-[rgba(82,200,140,0.12)] text-[#adf0cb]",
  "Atencao necessaria": "border-[rgba(237,102,102,0.36)] bg-[rgba(237,102,102,0.12)] text-[#ffc0c0]",
  "Pronto para exame": "border-[rgba(214,181,65,0.5)] bg-[rgba(241,211,72,0.16)] text-[#f6df7e]",
}

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? statusStyles["Iniciando"]
  return (
    <span
      className={`inline-flex h-9 w-fit items-center justify-center whitespace-nowrap rounded-full border px-3 text-center text-[10px] font-semibold leading-none tracking-[0.01em] ${style}`}
    >
      {status}
    </span>
  )
}
