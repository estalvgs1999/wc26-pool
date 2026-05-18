import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createPool } from './actions'

export default async function NewPoolPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex flex-col min-h-dvh px-4 pt-6 pb-10">
      <h1 className="text-2xl font-bold text-white">Nueva quiniela</h1>
      <p className="text-sm text-white/40 mt-0.5 mb-8">Crea tu pool y comparte el código con tus amigos</p>

      <form action={createPool} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Nombre
          </label>
          <input
            name="name"
            type="text"
            required
            minLength={3}
            maxLength={50}
            placeholder="Ej: La Oficina, Familia García…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/25 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Descripción <span className="text-white/20 normal-case font-normal">(opcional)</span>
          </label>
          <textarea
            name="description"
            maxLength={200}
            rows={3}
            placeholder="¿De qué va esta quiniela?"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/25 text-sm resize-none"
          />
        </div>

        <div className="h-px bg-white/10" />

        <p className="text-xs font-semibold uppercase tracking-wider text-white/40 -mb-2">Premio</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/40">
              Inscripción por jugador
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
              <input
                name="entry_fee"
                type="number"
                min={0}
                step={0.01}
                defaultValue={0}
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/25 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/40">
              Jugadores esperados
            </label>
            <input
              name="expected_players"
              type="number"
              min={2}
              max={500}
              placeholder="Ej: 20"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/25 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors"
        >
          Crear quiniela
        </button>
      </form>
    </div>
  )
}
