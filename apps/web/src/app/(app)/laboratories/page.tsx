import Footer from "@web/components/footer"
import LabsList from "@web/components/labs-list"
import { LabsService } from "@web/server/services/labs"
import SearchForm from "./_components/search-form"


const Laboratories = async () => {
  const labs = await LabsService.list()
  return (
    <div>
      <SearchForm/>
      {/* <LabsList labs={labs.map(lab => ({
        ...lab,
        phone: lab.phone ?? undefined,
        website: lab.website ?? undefined
      }))} /> */}
      <Footer/>

    </div>
  )
}

export default Laboratories
  