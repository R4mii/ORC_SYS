import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MailIcon, MessageSquare, PhoneCall } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Support Client</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Notre équipe est disponible pour vous aider avec toutes vos questions concernant ORCSYS.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 mb-10">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <PhoneCall className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Téléphone</CardTitle>
            <CardDescription>Appelez-nous directement</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="font-medium">+212 5 20 25 07 07</p>
            <p className="text-sm text-muted-foreground mt-1">Lun-Ven, 9h-18h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <MailIcon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Email</CardTitle>
            <CardDescription>Envoyez-nous un message</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="font-medium">support@orcsys.com</p>
            <p className="text-sm text-muted-foreground mt-1">Réponse sous 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Chat</CardTitle>
            <CardDescription>Discussion en direct</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="font-medium">Chat en direct</p>
            <p className="text-sm text-muted-foreground mt-1">Disponible 24/7</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Contactez-nous</CardTitle>
          <CardDescription>
            Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nom complet
                </label>
                <Input id="name" placeholder="Votre nom" />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input id="email" type="email" placeholder="votre@email.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Sujet
              </label>
              <Input id="subject" placeholder="Comment pouvons-nous vous aider?" />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea id="message" placeholder="Décrivez votre problème en détail..." rows={5} />
            </div>
            <Button type="submit" className="w-full md:w-auto">
              Envoyer le message
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">FAQ</h2>
        <div className="text-left max-w-3xl mx-auto space-y-4">
          <details className="border rounded-lg p-4">
            <summary className="font-medium cursor-pointer">Comment puis-je réinitialiser mon mot de passe?</summary>
            <div className="mt-2 text-muted-foreground">
              <p>
                Vous pouvez réinitialiser votre mot de passe en cliquant sur "Mot de passe oublié" sur la page de
                connexion. Un email vous sera envoyé avec les instructions pour créer un nouveau mot de passe.
              </p>
            </div>
          </details>
          <details className="border rounded-lg p-4">
            <summary className="font-medium cursor-pointer">Comment télécharger mes factures?</summary>
            <div className="mt-2 text-muted-foreground">
              <p>
                Vous pouvez télécharger vos factures depuis la section "Factures" de votre tableau de bord. Cliquez sur
                l'icône de téléchargement à côté de la facture que vous souhaitez obtenir.
              </p>
            </div>
          </details>
          <details className="border rounded-lg p-4">
            <summary className="font-medium cursor-pointer">
              Comment ajouter un nouvel utilisateur à mon compte?
            </summary>
            <div className="mt-2 text-muted-foreground">
              <p>
                Pour ajouter un nouvel utilisateur, accédez à "Paramètres" puis "Gestion des utilisateurs". Cliquez sur
                "Ajouter un utilisateur" et remplissez les informations requises.
              </p>
            </div>
          </details>
          <details className="border rounded-lg p-4">
            <summary className="font-medium cursor-pointer">
              Quels formats de fichiers sont pris en charge pour l'OCR?
            </summary>
            <div className="mt-2 text-muted-foreground">
              <p>
                Notre système OCR prend en charge les formats PDF, JPG, PNG et JPEG. Pour des résultats optimaux, nous
                recommandons des documents numérisés à une résolution d'au moins 300 DPI.
              </p>
            </div>
          </details>
        </div>
      </div>

      <div className="text-center mt-10">
        <p className="text-muted-foreground">
          Besoin de retourner au tableau de bord?{" "}
          <Link href="/dashboard" className="text-primary hover:underline">
            Retour au tableau de bord
          </Link>
        </p>
      </div>
    </div>
  )
}
