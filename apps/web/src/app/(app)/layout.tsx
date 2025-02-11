import Footer from '@web/components/footer'
import NavigationBar from '@web/components/navigation-bar'

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="mx-auto max-w-[1440px] px-4 pt-2 transition-all duration-300 sm:px-6 sm:pt-4 lg:px-8 lg:pt-6 xl:px-16">
        <NavigationBar />
      </div>
      {children}
      <Footer />
    </>
  )
}
