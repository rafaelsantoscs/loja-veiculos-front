import Link from "next/link";

 const HomePage = () => {
    return(
        <div className="
        bg-white dark:bg-[#2d3142] 
        bg-cover bg-center 
        bg-[url('/images/colaboradores/samu-light.jpg')] 
        dark:bg-[url('/images/colaboradores/samu-dark.jpg')]
        ">
        <>
            <header className="flex flex-row items-center justify-between h-20  py-4 px-8">
                <Link 
                href="/home" 
                className="font-bold text-2xl"
                > 
                   
                    <span className="text-samu-vermelho dark:text-samu-branco">SAMU</span>
                    
                </Link>
                {/* <div className="flex gap-5">
                    <Link className="border-none text-center py-2 px-4 rounded-3xl text-white bg-samu-vermelho" href="/login" >Entrar</Link>
                    <Link className="border-2 border-solid py-2  duration-200 px-4 rounded-3xl border-slate-300" href="/register">Registrar</Link>

                </div> */}
            </header>

            <body>
                
            </body>
        </>
        </div>
    )
}

export default HomePage;