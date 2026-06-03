"use client";

import { Footer } from "@/components/InitialScreen/Footer";
import { Navbar } from "@/components/InitialScreen/Navbar";
import React from "react";

const Termos: React.FC = () => {

  return (
    <div className="bg-white dark:bg-[#2d3142] 
        bg-cover bg-center 
        bg-[url('/images/colaboradores/samu-light.jpg')] 
        dark:bg-[url('/images/colaboradores/samu-dark.jpg')]">
    <>
    <Navbar/>
    <div className="px-4 py-8 max-w-3xl mx-auto pt-26
     "
    >
      <h1 className="text-3xl font-bold mb-6">Termos e Condições Gerais de Uso</h1>
      <p>
        Os serviços do <strong>https://frotavsa.iamtec.org/</strong> são fornecidos
        pela pessoa jurídica com o seguinte nome: IAM Tecnologia, titular da propriedade
        intelectual sobre software, website, aplicativos, conteúdos e demais
        ativos relacionados à plataforma <strong>https://frotavsa.iamtec.org/</strong>.
      </p>

      <h2 className="text-2xl font-semibold mt-6">1. Do objeto</h2>
      <p>
        A plataforma visa licenciar o uso de seu software, website,
        aplicativos e demais ativos de propriedade intelectual, fornecendo
        ferramentas para auxiliar e dinamizar o dia a dia dos seus usuários.
      </p>
      <p>
        A plataforma caracteriza-se pela prestação dos seguintes serviços:
        Gestão de checklist e controle de manutenção de veículos da frota, 
        registro e acompanhamento de abastecimentos, além do gerenciamento completo de itens necessários ao atendimento das ocorrências.
      </p>
      <p>
      Agendamentos, solicitações e cancelamentos de atendimentos diversos, relacionados a saúde.
      </p>

      <h2 className="text-2xl font-semibold mt-6">2. Da aceitação</h2>
      <p>
        O presente Termo estabelece obrigações contratadas de livre e
        espontânea vontade, por tempo indeterminado, entre a plataforma e as
        pessoas físicas ou jurídicas, usuárias do site. Ao utilizar a plataforma
        o usuário aceita integralmente as presentes normas e compromete-se a
        observá-las, sob o risco de aplicação das penalidades cabíveis. A
        aceitação do presente instrumento é imprescindível para o acesso e para
        a utilização de quaisquer serviços fornecidos pela empresa. Caso não
        concorde com as disposições deste instrumento, o usuário não deve
        utilizá-los.
      </p>

      <h2 className="text-2xl font-semibold mt-6">3. Do acesso dos usuários</h2>
      <p>
        Serão utilizadas todas as soluções técnicas à disposição do responsável
        pela plataforma para permitir o acesso ao serviço 24 (vinte e quatro)
        horas por dia, 7 (sete) dias por semana. No entanto, a navegação na
        plataforma ou em alguma de suas páginas poderá ser interrompida,
        limitada ou suspensa para atualizações, modificações ou qualquer ação
        necessária ao seu bom funcionamento, bem como por motivo de força maior.
      </p>

      <h2 className="text-2xl font-semibold mt-6">4. Do cadastro</h2>
      <p>
        O acesso às funcionalidades da plataforma exigirá a realização de um
        cadastro prévio e, a depender dos serviços, mais informações poderão
        ser solicitadas/coletadas. Ao se cadastrar, o usuário deverá informar
        dados completos, recentes e válidos, sendo de sua exclusiva
        responsabilidade manter referidos dados atualizados, bem como o
        usuário se compromete com a veracidade dos dados fornecidos.
      </p>
      <p>
        O usuário se compromete a não informar seus dados cadastrais e/ou de
        acesso à plataforma a terceiros, responsabilizando-se integralmente pelo
        uso que deles seja feito. Menores de 18 anos e aqueles que não possuírem
        plena capacidade civil deverão obter previamente o consentimento expresso
        de seus responsáveis legais para utilização da plataforma e dos serviços
        ou produtos, sendo de responsabilidade exclusiva dos mesmos o eventual
        acesso por menores de idade e por aqueles que não possuem plena capacidade
        civil sem a prévia autorização.
      </p>
      <p>
        Mediante a realização do cadastro o usuário declara e garante expressamente ser plenamente capaz, podendo exercer e usufruir livremente dos serviços e produtos. 
        O usuário deverá fornecer um endereço de e-mail válido, através do qual o site realizará todas comunicações necessárias. 
        Após a confirmação do cadastro, o usuário possuirá um login e uma senha pessoal, a qual assegura ao usuário o acesso individual à mesma. Desta forma, compete ao usuário exclusivamente a manutenção de referida senha de maneira confidencial e segura, evitando o acesso indevido às informações pessoais. 
        Toda e qualquer atividade realizada com o uso da senha será de responsabilidade do usuário, que deverá informar prontamente em caso de uso indevido da respectiva senha.
        Não será permitido ceder, vender, alugar ou transferir, de qualquer forma, a conta, que é pessoal e intransferível.
      </p>
      <p>
      Caberá ao usuário assegurar que o seu equipamento seja compatível com as características técnicas que viabilize a utilização da plataforma e dos serviços ou produtos.
      O usuário poderá, a qualquer tempo, requerer o cancelamento de seu cadastro junto ao site https://samuvitoria.iamtecnologia.org/. O seu descadastramento será realizado o mais rapidamente possível, desde que não sejam verificados problemas legais.   
      O usuário, ao aceitar os Termos e Política de Privacidade, autoriza expressamente a plataforma a coletar, usar, armazenar, tratar, ceder ou utilizar as informações derivadas do uso dos serviços, do site e quaisquer plataformas, incluindo todas as informações preenchidas pelo usuário no momento em que realizar ou atualizar seu cadastro, além de outras expressamente descritas na Política de Privacidade que deverá ser autorizada pelo usuário.

      </p>

      <h2 className="text-2xl font-semibold mt-6">5. Do cancelamento</h2>
      <p>
        O usuário poderá cancelar sua inscrição na plataforma de acordo com os
        termos que forem definidos no momento de sua contratação. O cancelamento
        se dará mediante contato com a plataforma, de acordo com o
        Código de Defesa do Consumidor (Lei no. 8.078/90).
      </p>
      <p>
        O serviço poderá ser cancelado por:
        <ul className="list-disc pl-6">
          <li>a) parte do usuário: nessas condições os serviços somente cessarão quando concluído o ciclo vigente ao tempo do cancelamento;</li>
          <li>b) violação dos Termos de Uso: os serviços serão cessados imediatamente.</li>
        </ul>
      </p>

      {/* <h2 className="text-2xl font-semibold mt-6">6. Do suporte</h2>
      <p>
        Em caso de qualquer dúvida, sugestão ou problema com a utilização da
        plataforma, o usuário poderá entrar em contato com o suporte, através
  do email <strong>visavsa@gmail.com</strong>.
      </p> */}

      <h2 className="text-2xl font-semibold mt-6">7. Das responsabilidades</h2>
      <p>
        É de responsabilidade do usuário:
        <ul className="list-disc pl-6">
          <li>a) defeitos ou vícios técnicos originados no próprio sistema do usuário;</li>
          <li>b) a correta utilização da plataforma, dos serviços ou produtos oferecidos, prezando pela boa convivência, pelo respeito e cordialidade entre os usuários;</li>
          <li>c) pelo cumprimento e respeito ao conjunto de regras disposto nesse Termo de Condições Geral de Uso, na respectiva Política de Privacidade e na legislação nacional e internacional;</li>
          <li>d) pela proteção aos dados de acesso à sua conta/perfil (login e senha).</li>
        </ul>
      </p>

      <p>
        É de responsabilidade da plataforma <strong>https://frotavsa.iamtec.org/</strong>:
        <ul className="list-disc pl-6">
          <li>a) indicar as características do serviço ou produto;</li>
          <li>b) os defeitos e vícios encontrados no serviço ou produto oferecido desde que lhe tenha dado causa;</li>
          <li>c) as informações que foram por ele divulgadas, sendo que os comentários ou informações divulgadas por usuários são de inteira responsabilidade dos próprios usuários;</li>
          <li>d) os conteúdos ou atividades ilícitas praticadas através da sua plataforma.</li>
        </ul>
      </p>

      <h2 className="text-2xl font-semibold mt-6">8. Dos direitos autorais</h2>
      <p>
        O presente Termo de Uso concede aos usuários uma licença não exclusiva,
        não transferível e não sublicenciável, para acessar e fazer uso da
        plataforma e dos serviços e produtos por ela disponibilizados.
      </p>

      <h2 className="text-2xl font-semibold mt-6">9. Das sanções</h2>
      <p>
        Sem prejuízo das demais medidas legais cabíveis, a IAM Tecnologia por intermédio de seu representante legal poderá, a qualquer momento, advertir, suspender ou cancelar
        a conta do usuário:
        <ul className="list-disc pl-6">
          <li>a) que violar qualquer dispositivo do presente Termo;</li>
          <li>b) que descumprir os seus deveres de usuário;</li>
          <li>c) que tiver qualquer comportamento fraudulento, doloso ou que ofenda a terceiros.</li>
        </ul>
      </p>

      <h2 className="text-2xl font-semibold mt-6">10. Da rescisão</h2>
      <p>
        A não observância das obrigações pactuadas neste Termo de Uso ou da
        legislação aplicável poderá, sem prévio aviso, ensejar a imediata
        rescisão unilateral por parte da IAM Tecnologia e o bloqueio de
        todos os serviços prestados ao usuário.
      </p>

      <h2 className="text-2xl font-semibold mt-6">11. Das alterações</h2>
      <p>
        Os itens descritos no presente instrumento poderão sofrer alterações,
        unilateralmente e a qualquer tempo, por parte da IAM Tecnologia, 
        para adequar ou modificar os serviços, bem como para atender
        novas exigências legais. As alterações serão veiculadas pelo site{" "}
        <strong>https://frotavsa.iamtec.org/</strong> e o usuário poderá optar por
        aceitar o novo conteúdo ou por cancelar o uso dos serviços, caso seja
        assinante de algum serviço.
      </p>

      <h2 className="text-2xl font-semibold mt-6">12. Da política de privacidade</h2>
      <p>
        Além do presente Termo, o usuário deverá consentir com as disposições
        contidas na respectiva Política de Privacidade a ser apresentada a todos
        os interessados dentro da interface da plataforma.
      </p>

      <h2 className="text-2xl font-semibold mt-6">13. Da legislação aplicável</h2>
      <p>
        O presente Termo de Uso é regido pela legislação brasileira, em
        especial pelo Código Civil Brasileiro, Código de Defesa do Consumidor e
        as disposições gerais do Código Penal.
      </p>

      <p>
        Por fim, se o usuário não concordar com algum dos termos descritos,
        deverá suspender o uso da plataforma.
      </p>
    </div>
    <Footer />
    </>
    </div>
  );
};

export default Termos;
