export interface SlideDetail {
  icon: string
  label: string
  value: string
  color?: string
}

export interface Slide {
  icon: string
  iconBg: string
  iconBorder: string
  title: string
  body: string
  detail?: SlideDetail[]
}

export const ONBOARDING_SLIDES: Slide[] = [
  {
    icon: '🏆',
    iconBg: 'linear-gradient(135deg, rgba(0,104,71,0.25) 0%, rgba(245,166,35,0.15) 100%)',
    iconBorder: 'rgba(245,166,35,0.25)',
    title: 'Bienvenido al WC26 Pool',
    body: 'La quiniela oficial del Mundial 2026. Predice marcadores, arma tu bracket y compite con amigos para ver quién conoce mejor el fútbol.',
  },
  {
    icon: '📅',
    iconBg: 'rgba(0,104,71,0.20)',
    iconBorder: 'rgba(0,104,71,0.30)',
    title: 'Fase de Grupos',
    body: 'Predice el marcador de los 48 partidos de grupos antes de que empiece el Mundial. Puedes llenar y editar tus picks libremente hasta el pitazo inicial del primer partido — después, todos quedan bloqueados.',
  },
  {
    icon: '⭐',
    iconBg: 'rgba(245,166,35,0.15)',
    iconBorder: 'rgba(245,166,35,0.25)',
    title: 'Puntos en Grupos',
    body: 'Cuanto más acertado sea tu pronóstico, más puntos ganas.',
    detail: [
      { icon: '🎯', label: 'Marcador exacto',      value: '5 pts', color: '#F5A623' },
      { icon: '↔️', label: 'Diferencia de goles',  value: '3 pts', color: '#F5A623' },
      { icon: '✅', label: 'Ganador o empate',      value: '1 pt',  color: '#F5A623' },
      { icon: '❌', label: 'Sin acierto',           value: '0 pts', color: 'rgba(255,255,255,0.3)' },
    ],
  },
  {
    icon: '🗂️',
    iconBg: 'rgba(26,79,160,0.25)',
    iconBorder: 'rgba(26,79,160,0.35)',
    title: 'Bracket Eliminatorio',
    body: 'Al terminar la fase de grupos, arma tu llave desde octavos hasta la final. Los picks del bracket se pueden ajustar mientras los equipos sigan vivos — si tu equipo queda eliminado, aún puedes recuperar con un nuevo pick al 40% de puntos.',
    detail: [
      { icon: '⚽', label: 'Octavos de final', value: '10 pts',  color: '#60a5fa' },
      { icon: '⚽', label: 'Cuartos de final', value: '40 pts',  color: '#60a5fa' },
      { icon: '⚽', label: 'Semifinal',        value: '80 pts',  color: '#60a5fa' },
      { icon: '⚽', label: 'Final',            value: '150 pts', color: '#F5A623' },
    ],
  },
  {
    icon: '👥',
    iconBg: 'rgba(206,17,38,0.15)',
    iconBorder: 'rgba(206,17,38,0.25)',
    title: 'Quinielas con Amigos',
    body: 'Crea tu quiniela privada, define el costo de entrada y comparte el código de invitación. El sistema calcula automáticamente el bote y lo reparte 50/30/20% entre los tres primeros lugares.',
  },
  {
    icon: '🎉',
    iconBg: 'linear-gradient(135deg, rgba(0,104,71,0.25) 0%, rgba(206,17,38,0.15) 100%)',
    iconBorder: 'rgba(245,166,35,0.30)',
    title: '¡Ya estás listo!',
    body: 'Empieza a predecir, sube en la tabla y demuestra que eres el mejor pronosticador del Mundial 2026. ¡Buena suerte! 🇲🇽🇨🇦🇺🇸',
  },
]
