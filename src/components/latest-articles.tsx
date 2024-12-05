'use client'

import Image from 'next/image'
import articles from '~/data/articles'
import { Card, CardContent, CardFooter } from './ui/card'
import { Avatar, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import {
  ArrowRight,
  EllipsisVertical,
  ExternalLink,
  Flag,
  Share,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export function DropdownOptions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={'icon'} className="rounded-full">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem className="inline-flex w-full items-center gap-2 px-6">
          <ExternalLink />
          <span>View Doctor&apos;s Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="inline-flex w-full items-center gap-2 px-6">
          <Share />
          <span>Share Article</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="inline-flex w-full items-center gap-2 px-6">
          <Flag />
          <span>Report Article</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ArticleCard({ article }: { article: (typeof articles)[number] }) {
  const [mouseOver, setMouseOver] = useState(false)

  return (
    <Card className="overflow-hidden rounded-none bg-transparent p-0">
      <Link href={`/articles/${article.title}`}>
        <CardContent
          onMouseEnter={() => setMouseOver(true)}
          onMouseLeave={() => setMouseOver(false)}
          className="border-b p-0 pb-6"
        >
          <Image
            src={article.photoUrl}
            alt={article.title}
            width={450}
            height={350}
            className="size-auto rounded-md object-cover"
          />
          <div className="flex flex-col items-start gap-2 py-4">
            <h3
              className={`text-base font-medium text-primary ${mouseOver ? 'underline' : ''}`}
            >
              {article.title}
            </h3>
            <p className="line-clamp-3 text-start text-sm text-muted-foreground opacity-75">
              {article.snippet}
            </p>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="inline-flex w-full justify-between px-0">
        <div className="inline-flex items-start gap-4 py-6">
          <Avatar>
            <AvatarImage src={article.doctorImage} />
          </Avatar>
          <div className="flex flex-col gap-0.5 text-start">
            <p className="text-sm font-medium text-primary">
              {article.doctorName}
            </p>
            <p className="text-sm text-muted-foreground">{article.specialty}</p>
          </div>
        </div>
        <DropdownOptions />
      </CardFooter>
    </Card>
  )
}

export default function LatestArticles() {
  return (
    <section id="latest-articles" className="w-full bg-secondary py-16">
      <div className="container mx-auto flex flex-col items-center justify-center gap-10">
        <div className="mx-auto flex w-full flex-col items-center justify-center gap-2">
          <h2 className="section-title">Latest Articles</h2>
          <p className="section-description">
            Expert tips and insights to support your health and wellness
            journey.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((article) => (
            <ArticleCard key={article.title} article={article} />
          ))}
        </div>

        <Button variant={'link'}>
          <span>Read More Articles</span>
          <ArrowRight />
        </Button>
      </div>
    </section>
  )
}
