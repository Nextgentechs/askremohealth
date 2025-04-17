import Footer from "@web/components/footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@web/components/ui/breadcrumb";
import ArticleForm from "./_components/article-form";


export default function Page() {
    return (
        <main className="container mx-auto mb-48 mt-12 flex min-h-screen w-full flex-col gap-12">
            <Breadcrumb className="lg:ps-3">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/articles`}>Articles</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Post</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <ArticleForm />
            <Footer />
        </main>
    )
}