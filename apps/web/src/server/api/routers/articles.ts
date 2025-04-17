import { ArticleService } from "@web/server/services/articles";
import { publicProcedure } from "../trpc";
import { articleListSchema } from "../validators";
import { log } from "node:console";

export const listArticles = publicProcedure
    .input(articleListSchema)
    .query(async ({ input }) => {
        log("input", input);
        return await ArticleService.getArticles(input);
    })