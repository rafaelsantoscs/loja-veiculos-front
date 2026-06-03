"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Colaborador, SlideFront } from "@/types/types-colaborador";
import { getUserLocalStorage } from "@/store/userLocalStorage";
import axiosInstance from "@/services/axiosInstance";
import Image from "next/image";
import {  FaEye, FaEyeSlash, FaImages, FaInfoCircle, FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Person } from "@mui/icons-material";
import { BASE_URL } from "@/config/config";
import { AxiosError } from "axios";




const uploadFotoColaborador = (id: number, file: File, token: string) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosInstance.post(`/colaboradores/${id}/upload-foto`, formData, {
        headers: { Authorization: `Bearer ${token}`,
        'Content-Type': undefined,
    },
    });
};


const uploadFotoSlide = (slideId: number, file: File, token: string) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance.post(`/slides/${slideId}/upload-foto`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': undefined,
    },
});

};

const FormCadastroColaborador = () => {
    const user = getUserLocalStorage() || {};
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [colaboradorId, setColaboradorId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [fotoFile, setFotoFile] = useState<File | null>(null);

    const [adicionarSlidesParaId, setAdicionarSlidesParaId] = useState<number | null>(null);
    const [slides, setSlides] = useState<SlideFront[]>([]);

    const [formData, setFormData] = useState<Partial<Colaborador>>({
        nome: "",
        imagem: "",
        raridade: "comum",
        cpf:"",
        dataAdmissao:"",
        dataDesligamento:"",
        funcao:"",

    });
    //colaboradores paginados
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 3;


    //slides
    const [slideEditando, setSlideEditando] = useState<SlideFront | null>(null);
    const [slideFotoFile, setSlideFotoFile] = useState<File | null>(null);
    const [uploadingSlideId, setUploadingSlideId] = useState<number | null>(null);
    const [successSlideId, setSuccessSlideId] = useState<number | null>(null);
    const [slidesVisiveis, setSlidesVisiveis] = useState<number[]>([]);


    const fetchColaboradores = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/colaboradores", {
                headers: { Authorization: `Bearer ${user.token ?? ""}` },
            });
            setColaboradores(response.data.sort((a: Colaborador, b: Colaborador) =>
                a.nome.localeCompare(b.nome)
            ));
        } catch {
            setColaboradores([]);
        } finally {
            setLoading(false);
        }
    }, [user.token]);

    useEffect(() => {
        fetchColaboradores();
        console.log("Base URL:", axiosInstance.defaults.baseURL);
    }, [fetchColaboradores]);

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const colaboradorParaSalvar = { ...formData };
        // Remover o campo imagem ao criar um novo colaborador
        if (!colaboradorId) delete colaboradorParaSalvar.imagem;

        await (colaboradorId
            ? axiosInstance.put(`/colaboradores/${colaboradorId}`, colaboradorParaSalvar, {
                  headers: { Authorization: `Bearer ${user.token ?? ""}` },
              })
            : axiosInstance.post("/colaboradores", colaboradorParaSalvar, {
                  headers: { Authorization: `Bearer ${user.token ?? ""}` },
              }));

         toast.success("Colaborador salvo com sucesso!");
        setFormData({ nome: "", imagem: "", raridade: "comum" });
        setFotoFile(null);
        setColaboradorId(null);
        fetchColaboradores();
    } catch {
         toast.error("Erro ao salvar colaborador.");
    } finally {
        setLoading(false);
        setTimeout(() => setMessage(null), 3000);
    }
};



    const handleEdit = (colaborador: Colaborador) => {
        setColaboradorId(colaborador.id ?? null);
        setFormData({ ...colaborador });
        setFotoFile(null);
    };

    // const handleDelete = async (id: number) => {
    //     await axiosInstance.delete(`/colaboradores/${id}`, {
    //         headers: { Authorization: `Bearer ${user.token ?? ""}` },
    //     });
    //     fetchColaboradores();
    // };


const handleDelete = async (id: number) => {
  try {
    await axiosInstance.delete(`/colaboradores/${id}`, {
      headers: { Authorization: `Bearer ${user.token ?? ""}` },
    });
    toast.success("Colaborador excluído com sucesso!");
    fetchColaboradores();
  } catch (error) {
    const axiosError = error as AxiosError;

    if (axiosError.response?.status === 409) {
      toast.error(axiosError.response.data as string);
    } else {
      toast.error("Erro ao excluir colaborador. Exclua os Slides dele antes");
    }
  }
};



    const addSlide = () => {
        setSlides([...slides, { title: "", description: "", image: "" }]);
    };

    const handleSlideChange = (
        index: number,
        field: 'title' | 'description' | 'image',
        value: string
    ) => {
        const newSlides = [...slides];
        newSlides[index][field] = value;
        setSlides(newSlides);
    };


    const removeSlide = (index: number) => {
        const newSlides = [...slides];
        newSlides.splice(index, 1);
        setSlides(newSlides);
    };

    const salvarSlides = async () => {
    if (!adicionarSlidesParaId) return;

    try {
        for (const slide of slides) {
            const response = await axiosInstance.post(`/slides`, {
                title: slide.title,
                description: slide.description,
                colaboradorId: adicionarSlidesParaId,
            }, {
                headers: { Authorization: `Bearer ${user.token ?? ""}` },
            });

            const slideSalvo = response.data;
            slide.id = slideSalvo.id;
        }

        //  Feedback visual
        toast.success("Slides adicionados com sucesso!");

        // Limpar slides e fechar form
        setSlides([]);
        setAdicionarSlidesParaId(null);

        //Atualizar lista de colaboradores
        fetchColaboradores();
    } catch {
        toast.error("Erro ao adicionar slides.");
    }
};

            const handleEditarSlide = (slide: SlideFront) => {
            setSlideEditando(slide);
            setSlideFotoFile(null);
            };

           
            // do colaborador 
            const handleUploadFoto = async () => {
                const idParaUpload = colaboradorId ?? formData.id;  //  Pega de colaboradorId ou de formData

                if (!idParaUpload || !fotoFile) return;

                setLoading(true);
                try {
                    await uploadFotoColaborador(idParaUpload, fotoFile, user.token ?? "");
                    toast.success("Foto atualizada com sucesso!");
                    setFotoFile(null);
                    fetchColaboradores();   // Atualiza a lista para refletir a nova imagem
                } catch {
                    toast.error("Erro ao atualizar foto.");
                } finally {
                    setLoading(false);
                    setTimeout(() => setMessage(null), 3000);
                }
            };

            // do slide 

            const handleUploadFotoSlide = async () => {
                if (!slideEditando?.id || !slideFotoFile) return;

                try {
                    setUploadingSlideId(slideEditando.id);
                    await uploadFotoSlide(slideEditando.id, slideFotoFile, user.token ?? "");
                    setSuccessSlideId(slideEditando.id);
                    // setSlideEditando(null);
                    setSlideFotoFile(null);
                    fetchColaboradores();
                } catch {
                    toast.error("Erro ao atualizar imagem do slide.");

                } finally {
                    setUploadingSlideId(null);
                    setTimeout(() => setSuccessSlideId(null), 3000);
                }
                };

                //salvar edição

                const handleSalvarEdicaoSlide = async () => {
                        if (!slideEditando?.id) return;

                        try {
                            await axiosInstance.put(`/slides/${slideEditando.id}`, {
                            title: slideEditando.title,
                            description: slideEditando.description,
                            }, {
                            headers: { Authorization: `Bearer ${user.token ?? ""}` },
                            });

                            toast.success("Slide atualizado com sucesso!");
                            setSlideEditando(null);
                            fetchColaboradores();
                        } catch (error) {
                             toast.error("Erro ao atualizar slide.");
                            console.error(error);
                        } finally {
                            setTimeout(() => setMessage(null), 3000);
                        }
                        };

                        const toggleSlidesVisiveis = (colaboradorId: number) => {
                            setSlidesVisiveis((prev) =>
                                prev.includes(colaboradorId)
                                ? prev.filter((id) => id !== colaboradorId)
                                : [...prev, colaboradorId]
                            );
                            };

                            const handleExcluirSlide = async (slideId: number) => {
                            if (!window.confirm("Tem certeza que deseja excluir este slide?")) return;

                            try {
                                await axiosInstance.delete(`/slides/${slideId}`, {
                                headers: { Authorization: `Bearer ${user.token ?? ""}` },
                                });
                                toast.success("Slide excluído com sucesso!");
                                setSlideEditando(null);
                                fetchColaboradores(); // Atualiza a lista após excluir
                            } catch (error) {
                                toast.error("Erro ao excluir o slide.");
                                console.error(error);
                            } finally {
                                setTimeout(() => setMessage(null), 3000);
                            }
                            };


                            const colaboradoresOrdenados = useMemo(() => {
                            return [...colaboradores].sort((b, a) => (a.id ?? 0) - (b.id ?? 0));
                            }, [colaboradores]);

                            const colaboradoresPaginados = useMemo(() => {
                            const inicio = (paginaAtual - 1) * itensPorPagina;
                            const fim = inicio + itensPorPagina;
                            return colaboradoresOrdenados.slice(inicio, fim);
                            }, [colaboradoresOrdenados, paginaAtual]);

                            const totalPaginas = useMemo(() => {
                            return Math.ceil(colaboradores.length / itensPorPagina);
                            }, [colaboradores.length]);







    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              Gestão de Colaboradores
              <div className="relative group">
                  <FaInfoCircle className="text-samu-azul cursor-pointer" />

                  {/* Tooltip visível somente no hover do ícone */}
                  <div 
                  className="hidden group-hover:block group-focus:block absolute 
                  left-1/2 -translate-x-1/2 mt-2 w-64 p-2 text-sm text-white
                   bg-slate-800 rounded shadow-lg z-50">
                      Esta área permite gerenciar a equipe que será exibida na área pública do sistema. 
                      As fotos e informações cadastradas aqui serão utilizadas na apresentação oficial da equipe na página externa.
                  </div>
              </div>
          </h2>
            {message && <p className="text-center text-sm">{message}</p>}

            {!adicionarSlidesParaId && (
                <form onSubmit={handleSubmit} className="space-y-3">
                 <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-samu-azul dark:text-samu-branco mb-1">
                          Nome do Colaborador
                      </label>
                      <input 
                          type="text" 
                          placeholder="Nome" 
                          value={formData.nome ?? ""} 
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })} 
                          required
                          className="w-full p-2 border rounded bg-transparent capitalize"
                      />
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-samu-azul dark:text-samu-branco mb-1">
                          Admissão/Posse
                      </label>
                      <input 
                          type="date" 
                          value={formData.dataAdmissao ?? ""} 
                          onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })} 
                          required
                          className="w-full p-2 border rounded bg-transparent"
                      />
                  </div>
              </div>




                    {colaboradorId && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                                  Foto do Colaborador
                              </label>
                              <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => e.target.files && setFotoFile(e.target.files[0])}
                                  className="w-full p-2 border rounded bg-transparent"
                              />
                          </div>

                          <div className="flex items-end">
                              <button 
                                  type="button"
                                  disabled={!fotoFile || loading}
                                  onClick={handleUploadFoto}
                                  className="w-full bg-transparent border border-samu-azul dark:border-samu-branco
                                  text-samu-azul dark:text-samu-branco hover:bg-samu-azul hover:text-samu-branco 
                                  dark:bg-transparent dark:hover:bg-samu-branco dark:hover:text-samu-azul 
                                  hover:cursor-pointer px-4 py-2 rounded"
                              >
                                  Atualizar Foto
                              </button>
                          </div>
                      </div>


                )}


                    {formData.imagem && !fotoFile && (
                        <Image 
                        src={`${BASE_URL}${formData.imagem}?v=${new Date().getTime()}`} 
                        alt="Foto atual" width={64} height={64} className="rounded-full mb-2" />
                    )}


                            <div className="mt-4 flex gap-2">
                                    {/* Botão Salvar/Atualizar */}
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="flex-1 bg-transparent border border-samu-vermelho dark:border-samu-branco
                                        text-samu-vermelho dark:text-samu-branco hover:bg-samu-vermelho hover:text-samu-branco 
                                        dark:bg-transparent dark:hover:bg-samu-branco dark:hover:text-samu-vermelho
                                        hover:cursor-pointer px-4 py-2 rounded"
                                    >
                                        {loading 
                                            ? (colaboradorId ? "Atualizando..." : "Salvando...")
                                            : (colaboradorId ? "Atualizar" : "Salvar")
                                        }
                                    </button>

                                    {/* Botão Cancelar */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData({ nome: "", imagem: "", dataAdmissao: "" });
                                            setColaboradorId(null);
                                            setFotoFile(null);
                                        }}
                                        className="flex-1 bg-transparent border border-samu-laranja dark:border-samu-laranja
                                        text-samu-laranja hover:bg-samu-laranja hover:text-white 
                                        dark:bg-transparent dark:hover:bg-samu-laranja dark:hover:text-white
                                        hover:cursor-pointer px-4 py-2 rounded"
                                    >
                                        Cancelar
                                    </button>
                                </div>




                            </form>
                        )}

                                {adicionarSlidesParaId && (
                                    <div className="mt-6">
                                        <h3 className="text-xl font-bold">Adicionar Slides</h3>
                                        {slides.map((slide, index) => (
                                            <div key={index} className="border p-2 mb-2 rounded">
                                                <input type="text" placeholder="Título" value={slide.title}
                                                    onChange={(e) => handleSlideChange(index, "title", e.target.value)}
                                                    className="w-full mb-2 p-1 border rounded" />
                                                <input type="text" placeholder="Descrição" value={slide.description}
                                                    onChange={(e) => handleSlideChange(index, "description", e.target.value)}
                                                    className="w-full mb-2 p-1 border rounded" />
                                            
                                                <button type="button" onClick={() => removeSlide(index)}
                                                    className="text-red-600 text-sm">Remover Slide</button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={addSlide}
                                            className="bg-blue-600 text-white px-4 py-2 rounded">Adicionar Slide</button>

                                        <button type="button" onClick={salvarSlides}
                                            className="w-full bg-green-600 text-white px-4 py-2 mt-4 rounded">Salvar Slides</button>

                                        <button type="button" onClick={() => setAdicionarSlidesParaId(null)}
                                            className="w-full bg-gray-500 text-white px-4 py-2 mt-2 rounded">Cancelar</button>
                                    </div>
                                )}

                                <h3 className="text-xl font-bold mt-8">Colaboradores</h3>
                                <ul className="mt-4">
                                {/* {colaboradores */}
                                {colaboradoresPaginados.map((colab) => (
                                    <li key={colab.id} 
                                    className="border p-2 mb-4 rounded bg-transparent text-samu-azul dark:text-samu-branco">
                                    <div className="flex items-center justify-between gap-4 flex-wrap">
                                        <div className="flex items-center">
                                        <Image
                                            src={colab.imagem 
                                            ? `${BASE_URL}${colab.imagem}?v=${new Date().getTime()}`
                                            : "/images/logo/logoSamu.png"}
                                            alt={colab.nome}
                                            width={64}
                                            height={64}
                                            className="object-cover rounded-full mr-4"
                                        />
                                        <div>
                                            <p className="font-semibold text-samu-azul dark:text-white">{colab.nome}</p>
                                        </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-2">
                                       <button
                                            onClick={() => handleEdit(colab)}
                                            className=" bg-transparent border border-samu-laranja dark:border-samu-branco
                                            text-samu-laranja dark:text-samu-branco hover:bg-samu-laranja hover:text-white 
                                            dark:hover:bg-samu-branco dark:hover:text-samu-laranja px-4 py-2 rounded hover:cursor-pointer"
                                            >
                                            {/* <FaEdit /> */}
                                            <Person />
                                            <span className="hidden sm:inline">Editar</span>
                                            </button>

                                            <button
                                            onClick={() => colab.id && handleDelete(colab.id)}
                                            className=" bg-transparent border border-samu-vermelho dark:border-samu-branco
                                            text-samu-vermelho dark:text-samu-branco hover:bg-samu-vermelho hover:text-white 
                                            dark:hover:bg-samu-branco dark:hover:text-samu-vermelho px-4 py-2 rounded hover:cursor-pointer"
                                            >
                                            <FaTrash />
                                            <span className="hidden sm:inline">Excluir</span>

                                            </button>

                                            <button
                                            onClick={() => setAdicionarSlidesParaId(colab.id!)}
                                            className=" bg-transparent border border-samu-azul dark:border-samu-branco
                                            text-samu-azul dark:text-samu-branco hover:bg-samu-azul hover:text-white 
                                            dark:hover:bg-samu-branco dark:hover:text-samu-azul px-4 py-2 rounded hover:cursor-pointer"
                                            >
                                            <FaPlus />
                                            <FaImages />
                                            <span className="hidden sm:inline">Slides</span>
                                            </button>

                                            <button
                                            onClick={() => toggleSlidesVisiveis(colab.id!)}
                                            className=" bg-transparent border border-slate-600 dark:border-slate-300
                                            text-slate-600 dark:text-slate-300 hover:bg-slate-600 hover:text-white 
                                            dark:hover:bg-slate-300 dark:hover:text-slate-800 px-4 py-2 rounded hover:cursor-pointer"
                                            >
                                            {slidesVisiveis.includes(colab.id!) ? <FaEyeSlash /> : <FaEye />}
                                            <span className="hidden sm:inline">
                                                {slidesVisiveis.includes(colab.id!) ? "Ocultar" : "Exibir"}
                                            </span>
                                            </button>

                            </div>

                        </div>
                        

                        {/* Listar slides */}
                        
                            {slidesVisiveis.includes(colab.id!) && colab.slides && colab.slides.length > 0 && (

                            <ul className="mt-4 pl-4 border-l">
                            {colab.slides.map((slide) => (
                                <li
                                    key={slide.id}
                                    className="bg-transparent text-samu-azul dark:text-samu-branco 
                                    border-l-4 border-samu-azul rounded-lg p-4 shadow mb-4"
                                >
                               {slideEditando?.id === slide.id ? (
                                            <div className="mt-2 space-y-4">
                                                {/* Campos de edição */}
                                                <label className="block text-sm font-medium text-samu-azul dark:text-samu-branco">
                                                Título
                                                </label>
                                                <input
                                                type="text"
                                                value={slideEditando?.title ?? ""}
                                                onChange={(e) =>
                                                    setSlideEditando((prev) =>
                                                    prev ? { ...prev, title: e.target.value } : prev
                                                    )
                                                }
                                                maxLength={50}
                                                className="w-full p-2 mb-2 border border-samu-azul dark:border-samu-branco rounded bg-transparent text-samu-azul dark:text-white"
                                                />


                                                <label className="block text-sm font-medium text-samu-azul dark:text-samu-branco">
                                                Descrição
                                                </label>
                                                <input
                                            type="text"
                                            value={slideEditando?.description ?? ""}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setSlideEditando((prev) =>
                                                prev ? { ...prev, description: e.target.value } : prev
                                            )
                                            }
                                            maxLength={250}
                                            className="w-full p-2 mb-2 border border-samu-azul dark:border-samu-branco rounded 
                                            bg-transparent text-samu-azul dark:text-white"
                                            />


                                                {/* Imagem atual e novo upload */}
                                                <div className="grid md:grid-cols-3 gap-4 items-end">
                                                <div className="text-center md:text-left">
                                                    <span className="block text-sm text-samu-azul dark:text-samu-branco mb-2">
                                                    Imagem atual
                                                    </span>
                                                    <Image
                                                    src={
                                                        slide.image && slide.image.trim() !== ""
                                                        ? `${BASE_URL}${slide.image}?v=${new Date().getTime()}`
                                                        : "/images/logo/logoSamu.png"
                                                    }
                                                    alt={slide.title}
                                                    width={120}
                                                    height={120}
                                                    className="rounded border border-slate-600 shadow mx-auto md:mx-0"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm text-samu-azul dark:text-samu-branco mb-1">
                                                    Nova imagem
                                                    </label>
                                                    <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) =>
                                                        e.target.files && setSlideFotoFile(e.target.files[0])
                                                    }
                                                    className="w-full bg-transparent border border-samu-azul dark:border-samu-branco text-samu-azul dark:text-samu-branco px-4 py-2 rounded"
                                                    />
                                                </div>

                                                <div className="md:col-span-1">
                                                    <button
                                                    onClick={handleUploadFotoSlide}
                                                    disabled={!slideFotoFile || uploadingSlideId === slide.id}
                                                    className="w-full bg-transparent border border-samu-azul dark:border-samu-branco text-samu-azul dark:text-samu-branco hover:bg-samu-azul hover:text-samu-branco dark:hover:bg-samu-branco dark:hover:text-samu-azul px-4 py-2 rounded"
                                                    >
                                                    {uploadingSlideId === slide.id
                                                        ? "Enviando..."
                                                        : successSlideId === slide.id
                                                        ? "Imagem Atualizada!"
                                                        : "Atualizar Imagem"}
                                                    </button>
                                                </div>
                                                </div>

                                                {/* Botões de ação */}
                                                <div className="flex flex-wrap gap-2 mt-4">
                                                <button
                                                    onClick={handleSalvarEdicaoSlide}
                                                    className="bg-transparent border border-green-600 dark:border-green-500 text-green-600 dark:text-green-500 hover:bg-green-600 hover:text-white dark:hover:bg-green-500 dark:hover:text-white px-4 py-2 rounded"
                                                >
                                                    Salvar Alterações
                                                </button>

                                                <button
                                                    onClick={() => setSlideEditando(null)}
                                                    className="bg-transparent border border-slate-500 dark:border-slate-400 text-slate-500 dark:text-slate-300 hover:bg-slate-500 hover:text-white dark:hover:bg-slate-400 dark:hover:text-white px-4 py-2 rounded"
                                                >
                                                    Cancelar
                                                </button>

                                                <button
                                                    onClick={() => handleExcluirSlide(slide.id!)}
                                                    className="bg-transparent border border-samu-vermelho dark:border-samu-branco text-samu-vermelho dark:text-samu-branco hover:bg-samu-vermelho hover:text-white dark:hover:bg-samu-branco dark:hover:text-samu-vermelho px-4 py-2 rounded"
                                                >
                                                    Excluir Slide
                                                </button>
                                                </div>
                                            </div>
                                            ) : (
                                            <>
                                                <p className="text-lg font-semibold mb-1">{slide.title}</p>
                                                <p className="text-sm text-slate-400 mb-2">{slide.description}</p>
                                                <button
                                                onClick={() => handleEditarSlide(slide)}
                                                className="mt-2 bg-samu-azul text-white px-4 py-2 rounded hover:bg-samu-azul/80"
                                                >
                                                Editar Slide
                                                </button>
                                            </>
                                            )}



                             
                                </li>
                            ))}
                            </ul>
                        )}
                        </li>
                    ))}
                    </ul>
                             {/* botoes de ir e voltar */}
                      <div className="flex justify-center mt-4 gap-2">
                        <button
                            onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                            disabled={paginaAtual === 1}
                            // className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-50"
                            className=" bg-transparent border border-samu-vermelho dark:border-samu-branco
                            text-samu-vermelho dark:text-samu-branco hover:bg-samu-vermelho hover:text-samu-branco
                            dark:bg-transparent dark:hover:bg-samu-branco dark:hover:text-samu-vermelho
                            hover:cursor-pointer px-4 py-2 rounded disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        <span className="text-samu-azul dark:text-samu-branco  px-2">Página {paginaAtual}/{totalPaginas}</span>
                        <button
                            onClick={() =>
                            setPaginaAtual((prev) =>
                                prev < Math.ceil(colaboradores.length / itensPorPagina) ? prev + 1 : prev
                            )
                            }
                            disabled={paginaAtual === Math.ceil(colaboradores.length / itensPorPagina)}
                            // className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-50"
                            className=" bg-transparent border border-samu-vermelho dark:border-samu-branco
                            text-samu-vermelho dark:text-samu-branco hover:bg-samu-vermelho hover:text-samu-branco
                            dark:bg-transparent dark:hover:bg-samu-branco dark:hover:text-samu-vermelho
                            hover:cursor-pointer px-4 py-2 rounded disabled:opacity-50"

                        >
                            Próxima
                        </button>
                        </div>

                </div>
    );
};

export default FormCadastroColaborador;
