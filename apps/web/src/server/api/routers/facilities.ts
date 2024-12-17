import { createTRPCRouter, publicProcedure } from '../trpc'

export const facilitiesRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.facilities.findMany({
      columns: {
        id: true,
        name: true,
        address: true,
        county: true,
        town: true,
        phone: true,
        website: true,
      },
    })
  }),
})
