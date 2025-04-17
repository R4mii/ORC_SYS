import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, BarChart3, FileText, Upload, PieChart, Shield, Clock, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[80%] bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[70%] bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <Badge className="w-fit bg-primary/10 text-primary border-primary/20 mb-2">Innovant & Intuitif</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Solutions Comptables Modernes pour Entreprises en Croissance
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Simplifiez vos opérations financières avec notre plateforme intuitive. Gagnez du temps, réduisez les
                  erreurs et obtenez des insights précieux.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/auth/register">
                  <Button size="lg" className="px-8 shadow-lg shadow-primary/20">
                    Commencer
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="px-8">
                    En savoir plus
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full h-full min-h-[300px] md:min-h-[400px] lg:min-h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg transform rotate-2 shadow-xl"></div>
                <img
                  src="/placeholder.svg?height=600&width=800"
                  alt="Dashboard Preview"
                  className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-2xl transform -rotate-1 transition-all duration-300 hover:rotate-0 hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="w-full py-12 md:py-16 lg:py-20 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tighter md:text-3xl">
                Utilisé par des Entreprises du Monde Entier
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                Rejoignez des milliers d'entreprises qui utilisent notre plateforme pour optimiser leurs processus
                comptables
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16 mt-6">
              {["Company A", "Company B", "Company C", "Company D", "Company E"].map((company, index) => (
                <div key={company} className="flex items-center justify-center group">
                  <div className="text-2xl font-bold text-muted-foreground/60 transition-all duration-200 group-hover:text-primary/80">
                    {company}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[10%] right-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[10%] left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <Badge className="bg-primary/10 text-primary border-primary/20">Fonctionnalités</Badge>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Tout ce dont vous avez besoin en un seul endroit
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                Notre plateforme complète fournit tous les outils nécessaires pour gérer vos finances efficacement
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<FileText className="h-10 w-10 text-primary" />}
              title="Facturation"
              description="Créez et gérez des factures professionnelles avec des rappels automatisés et un suivi des paiements"
            />
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10 text-primary" />}
              title="Rapports Financiers"
              description="Générez des rapports complets avec des données en temps réel pour prendre des décisions éclairées"
            />
            <FeatureCard
              icon={<Upload className="h-10 w-10 text-primary" />}
              title="Gestion Documentaire"
              description="Téléchargez et organisez tous vos documents financiers en un seul endroit sécurisé"
            />
            <FeatureCard
              icon={<PieChart className="h-10 w-10 text-primary" />}
              title="Gestion Fiscale"
              description="Simplifiez la préparation des impôts avec des calculs automatisés et des vérifications de conformité"
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-primary" />}
              title="Données Sécurisées"
              description="Une sécurité de niveau bancaire garantit que vos informations financières sont toujours protégées"
            />
            <FeatureCard
              icon={<Clock className="h-10 w-10 text-primary" />}
              title="Automatisation"
              description="Automatisez les tâches répétitives pour vous concentrer sur ce qui compte le plus pour votre entreprise"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <Badge className="bg-primary/10 text-primary border-primary/20">Comment ça marche</Badge>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Processus Simple, Résultats Puissants
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                Commencez en quelques minutes et transformez votre gestion financière
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
            <StepCard
              number="01"
              title="Inscription"
              description="Créez votre compte en quelques minutes avec notre processus d'intégration simple"
            />
            <StepCard
              number="02"
              title="Connectez vos données"
              description="Importez vos données financières existantes ou commencez avec notre plateforme intuitive"
            />
            <StepCard
              number="03"
              title="Commencez à gérer"
              description="Utilisez nos outils puissants pour optimiser vos processus comptables"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <Badge className="bg-primary/10 text-primary border-primary/20">Témoignages</Badge>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Ce que disent nos clients</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                Découvrez comment des entreprises ont transformé leurs opérations financières avec notre plateforme
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            <TestimonialCard
              quote="Experio a complètement transformé notre façon de gérer nos finances. Les économies de temps à elles seules ont valu l'investissement."
              author="Sarah Johnson"
              position="Directrice Financière, TechStart Inc."
            />
            <TestimonialCard
              quote="Les fonctionnalités de reporting nous donnent des insights que nous n'avions jamais eus auparavant. Nous pouvons prendre de meilleures décisions avec des données en temps réel."
              author="Michael Chen"
              position="PDG, GrowthWave"
            />
            <TestimonialCard
              quote="L'équipe de support client est exceptionnelle. Ils nous ont aidés à personnaliser la plateforme pour répondre à nos besoins uniques."
              author="Emma Rodriguez"
              position="Directrice Financière, Innovate Ltd"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <Badge className="bg-primary/10 text-primary border-primary/20">Tarification</Badge>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Tarification Simple et Transparente
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                Choisissez le forfait qui convient le mieux aux besoins de votre entreprise
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <PricingCard
              title="Démarrage"
              price="29€"
              description="Parfait pour les petites entreprises qui débutent"
              features={["Facturation de base", "Rapports financiers", "Stockage de documents", "Support par email"]}
              buttonText="Commencer"
            />
            <PricingCard
              title="Professionnel"
              price="79€"
              description="Idéal pour les entreprises en croissance avec des besoins plus complexes"
              features={[
                "Facturation avancée",
                "Rapports complets",
                "Gestion fiscale",
                "Support prioritaire",
                "Collaboration d'équipe",
              ]}
              buttonText="Commencer"
              highlighted={true}
            />
            <PricingCard
              title="Entreprise"
              price="149€"
              description="Pour les entreprises établies avec des exigences avancées"
              features={[
                "Facturation personnalisée",
                "Analyses avancées",
                "Accès API",
                "Gestionnaire de compte dédié",
                "Intégrations personnalisées",
                "Sessions de formation",
              ]}
              buttonText="Contacter les ventes"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Prêt à transformer votre gestion financière ?
              </h2>
              <p className="max-w-[700px] md:text-xl">
                Rejoignez des milliers d'entreprises qui utilisent déjà notre plateforme pour optimiser leurs processus
                comptables
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="px-8 shadow-lg">
                  Commencer maintenant
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-primary-foreground px-8 hover:bg-white/10">
                  Contacter les ventes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="flex flex-col items-center text-center h-full hover:shadow-md transition-all duration-200 hover:-translate-y-1 border-muted">
      <CardHeader>
        <div className="p-3 bg-primary/10 rounded-full mb-4 w-16 h-16 flex items-center justify-center">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <Card className="relative overflow-hidden border-none bg-background shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div className="absolute -top-6 -left-6 text-8xl font-bold text-primary/10">{number}</div>
      <CardHeader className="pt-8">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function TestimonialCard({ quote, author, position }: { quote: string; author: string; position: string }) {
  return (
    <Card className="h-full hover:shadow-md transition-all duration-200 hover:-translate-y-1 border-muted">
      <CardHeader>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="h-5 w-5 fill-current text-primary" />
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col justify-between h-full">
        <p className="italic text-muted-foreground mb-4">"{quote}"</p>
        <div>
          <p className="font-medium">{author}</p>
          <p className="text-sm text-muted-foreground">{position}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function PricingCard({
  title,
  price,
  description,
  features,
  buttonText,
  highlighted = false,
}: {
  title: string
  price: string
  description: string
  features: string[]
  buttonText: string
  highlighted?: boolean
}) {
  return (
    <Card
      className={`flex flex-col h-full transition-all duration-200 hover:-translate-y-1 ${highlighted ? "border-primary shadow-lg relative" : "border-muted hover:shadow-md"}`}
    >
      {highlighted && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-medium py-1 px-3 rounded-full">
          Le plus populaire
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-muted-foreground">/mois</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <div className="p-6 pt-0 mt-auto">
        <Link href="/auth/register">
          <Button className="w-full" variant={highlighted ? "default" : "outline"}>
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}
