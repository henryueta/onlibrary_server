import { createClient } from "@supabase/supabase-js";

const supabaseConnection = {

    url:"https://wtrxmsmkatrnenkhanra.supabase.co",
    key:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0cnhtc21rYXRybmVua2hhbnJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMjQyNjUsImV4cCI6MjA1NjYwMDI2NX0.iWgJ6XJ84d57ea1-HqrzSOpp5RyuRTDK2OWXaUz0DCo"
}

const client = createClient(supabaseConnection.url,supabaseConnection.key)

export default client

