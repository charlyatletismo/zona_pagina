import { createFileRoute } from '@tanstack/react-router'
import { UsersIcon, TargetIcon, TrophyIcon, HeartIcon } from 'lucide-react'
import { CardGrid } from '@/components/cardGrid'
import unprotectedCheck from '@/lib/beforeLoadGenericCheck'


export const Route = createFileRoute('/about')({
  component: About,
  beforeLoad: unprotectedCheck(),
})


function About() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative py-16 bg-primary/5 mb-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-primary rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Sobre <span className="text-primary relative inline-block">
              Zona Atletismo
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Una startup apasionada por el atletismo que organiza maratones y eventos deportivos excepcionales.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Nuestra Historia */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">Nuestra Historia</h2>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Zona Atletismo nació de la pasión por el deporte y el deseo de crear experiencias inolvidables para corredores de todos los niveles.
              Fundada por un pequeño equipo de entusiastas del atletismo, nuestra startup se dedica principalmente a la organización de maratones
              y eventos deportivos que inspiran y motivan a la comunidad atlética.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Creemos que el atletismo no solo es un deporte, sino una forma de vida que une a las personas, desafía límites y celebra logros.
              Con cada evento que organizamos, buscamos crear momentos memorables que queden grabados en el corazón de cada participante.
            </p>
          </div>
        </section>

        {/* Nuestros Valores */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">Nuestros Valores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CardGrid
              icon={<HeartIcon />}
              title="Pasión"
              description="Vivimos y respiramos atletismo. Nuestra energía y entusiasmo se reflejan en cada detalle de nuestros eventos."
            />
            <CardGrid
              icon={<UsersIcon />}
              title="Comunidad"
              description="Fomentamos un sentido de pertenencia y camaradería entre corredores, creando lazos que van más allá de la línea de meta."
            />
            <CardGrid
              icon={<TargetIcon />}
              title="Excelencia"
              description="Nos esforzamos por la perfección en cada aspecto, desde la organización hasta la experiencia del corredor."
            />
            <CardGrid
              icon={<TrophyIcon />}
              title="Superación"
              description="Celebramos no solo las victorias, sino el esfuerzo personal y el crecimiento de cada atleta."
            />
          </div>
        </section>

        {/* Nuestro Equipo */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">Nuestro Equipo</h2>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Detrás de Zona Atletismo hay un equipo pequeño pero dedicado de profesionales apasionados por el atletismo.
              Cada miembro aporta su experiencia única, desde la organización de eventos hasta el apoyo técnico y logístico.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Aunque somos un equipo compacto, nuestra red de colaboradores y voluntarios nos permite llevar a cabo eventos
              de gran envergadura. Creemos en el poder del trabajo en equipo y en la importancia de cada contribución,
              por pequeña que parezca.
            </p>
          </div>
        </section>

        {/* Lo Que Hacemos */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">Lo Que Hacemos</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-primary">Maratones</h3>
                <p className="text-muted-foreground">
                  Organizamos maratones completos de 42.195 km, medias maratones y carreras de distancias variadas.
                  Nuestros eventos están diseñados para desafiar y celebrar el espíritu competitivo de los corredores.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-primary">Eventos Especiales</h3>
                <p className="text-muted-foreground">
                  Además de maratones, creamos eventos temáticos, carreras benéficas y competiciones que unen deporte,
                  diversión y causas nobles. Cada evento es único y refleja nuestra creatividad e innovación.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-primary">Apoyo Integral</h3>
                <p className="text-muted-foreground">
                  Ofrecemos servicios completos de organización, incluyendo cronometraje electrónico, avituallamiento,
                  seguridad y cobertura mediática. Nos aseguramos de que cada corredor tenga la mejor experiencia posible.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-primary">Comunidad</h3>
                <p className="text-muted-foreground">
                  Construimos y nutrimos una comunidad de atletas apasionados. A través de nuestros eventos,
                  workshops y redes sociales, conectamos a corredores de todas las edades y niveles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Llamado a la Acción */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-4">Únete a Nuestra Comunidad</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            ¿Listo para vivir la emoción del atletismo? Participa en nuestros próximos eventos o contáctanos
            si quieres organizar tu propio maratón.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/sportingEvents"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ver Eventos
            </a>
            <a
              href="https://wa.me/5493400660640?text=Hola Zona Atletismo, me gustaría saber más sobre sus servicios"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 border border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Contactar
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
