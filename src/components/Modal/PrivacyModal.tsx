import React from "react";

const PrivacyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div className="bg-white dark:bg-gray-800 p-8 max-w-2xl mx-auto rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Política de Privacidade</h2>
      
      {/* Contêiner com rolagem para o conteúdo */}
      <div className="max-h-96 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">Política de Privacidade</h1>
      <p className="mb-4">
        Estas Políticas de Privacidade aplicam-se a todos os Usuários
        cadastrados e integram os Termos e condições gerais de uso do sistema
        SaudeVSA, desenvolvido por Isaac Augusto Martiniano, pessoa física de
        direito privado, devidamente inscrita no CPF nº 014.668.174-61, titular
        da propriedade intelectual sobre software, website, aplicativos,
        conteúdos e demais ativos relacionados à plataforma
        https://saudevsa.com.br.
      </p>

      <p className="mb-4">
        Estas Políticas de privacidade contêm informações claras e completas
        sobre coleta, uso, armazenamento, tratamento e proteção dos dados
        pessoais dos Usuários e visitantes do SaudeVSA, com a finalidade de
        demonstrar absoluta transparência quanto a este importante assunto.
      </p>

      <p className="mb-4">
      O SaudeVSA , pela natureza dos Serviços prestados, poderá acessar, coletar, armazenar e, em alguns casos, revelar informações de seus usuários e visitantes relativas aos dados cadastrais e registros de acesso ao seu Site/App, para terceiros, tais como, não se limitando a fornecedores, parceiros comerciais, autoridades e pessoas físicas ou jurídicas que aleguem ter sido lesadas por Usuários cadastrados.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        SEÇÃO 01 - Coleta e Armazenamento de Dados Pessoais
      </h2>
      <p className="mb-4">
        A primeira providência para utilizar os Serviços do SaudeVSA é
        cadastrar-se e informar seus dados pessoais: Nome, CPF, Email,
        Telefone, Login, Cidade, Data de Nascimento, Instagram, Endereço
        Completo, Número SUS, Nome e Telefone de Contato de Emergência,
        Histórico de Saúde.
      </p>

      <p className="mb-4">
      O SaudeVSA coleta e armazena automaticamente algumas informações sobre a atividade dos Usuários cadastrados e visitantes de seu aplicativo/site. Tal informação pode incluir a URL de onde eles provêm; a que URL acessaram em seguida; o navegador que utilizam e seus IPs de acesso; as páginas visitadas; as buscas realizadas, dentre outras que poderão ser armazenadas e retidas.
      </p>

      <p className="mb-4">
      O SaudeVSA poderá acessar as listas de contatos dos dispositivos móveis utilizados pelos usuários para fornecer seus Serviços. Essa informação somente será utilizada para localizar e marcar números de telefones celulares e/ou endereços de e-mails de potenciais usuários.
      </p>

      <p className="mb-4">
        Ficam cientes os Usuários de que seu perfil na plataforma estará acessível a todos demais Usuários e visitantes do SaudeVSA.O SaudeVSA coleta e armazena automaticamente algumas informações sobre a atividade dos Usuários cadastrados e visitantes de seu aplicativo/site. Tal informação pode incluir a URL de onde eles provêm; a que URL acessaram em seguida; o navegador que utilizam e seus IPs de acesso; as páginas visitadas; as buscas realizadas, dentre outras que poderão ser armazenadas e retidas.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        SEÇÃO 02 - Segurança da Informação
      </h2>
      <p className="mb-4">
        O SaudeVSA observará todas as normas aplicáveis em matéria de medidas de
        segurança de Informação Pessoal. O SaudeVSA considera os dados de seus
        Usuários como um bem precioso que deve ser protegido de qualquer perda
        ou acesso não autorizado.
      </p>

      <p>Ainda assim, é necessário considerar que a segurança absoluta não existe na internet</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        SEÇÃO 03 - Utilização da Informação
      </h2>
      <p className="mb-4">
        Para fornecer um bom serviço e para que os usuários possam realizar
        operações de forma ágil e segura, o SaudeVSA requer certas informações
        de caráter pessoal, incluindo endereço de e-mail.
      </p>

      <p className="mb-4">
      •Desenvolver estudos internos sobre os interesses, comportamentos e demografia dos Usuários para compreender melhor suas necessidades e interesses e oferecer melhores Serviços ou prover-lhes informação adequada ao seu perfil.
      </p>

      <p className="mb-4">
      •Fornecer a Informação Pessoal dos Usuários às entidades que intervenham na resolução de disputas entre eles: seguradoras, juízos arbitrais, e demais órgãos competentes para solucionar tais disputas.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        SEÇÃO 04 - Confidencialidade da Informação
      </h2>
      <p className="mb-4">
      Uma vez registrado no Site, o SaudeVSA não venderá, alugará ou compartilhará a Informação Pessoal, exceto nas formas estabelecidas nestas Políticas de privacidade. Será feito tudo o que estiver ao alcance no sentido de proteger a privacidade da Informação Pessoal.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        SEÇÃO 05 - Serviços de Terceiros
      </h2>
      <p className="mb-4">
        No geral, os fornecedores terceirizados usados pelo SaudeVSA irão
        apenas coletar, usar e divulgar suas informações na medida do necessário
        para permitir que estes terceiros realizem seus serviços. 
        <br/>
        Para esses fornecedores terceirizados, o SaudeVSA aconselha aos Usuários que leiam as políticas de privacidade daqueles para que fique claro a maneira na qual as informações pessoais dos Usuários serão usadas por esses fornecedores terceirizados.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        SEÇÃO 06 - Senha Pessoal
      </h2>
      <p className="mb-4">
      Para acesso dos serviços reservados unicamente aos Usuários devidamente registrados, estes irão dispor de uma senha pessoal. Com ela poderão acessar, consultar, verificar, fornecer informações, dentre outras atividades. Esta senha, que é escolhida pelo próprio Usuário, deve ser mantida sob absoluta confidencialidade e, em nenhum caso, deverá ser revelada ou compartilhada com outras pessoas.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        SEÇÃO 07 - Cookies
      </h2>
      <p className="mb-4">
      O Usuário e o visitante do site do sistema SaudeVSA manifesta conhecer e aceitar que poderá ser utilizado um sistema de coleta de dados de navegação mediante à utilização de cookies. Os cookies são pequenos arquivos que se instalam no disco rígido, com uma duração limitada de tempo que ajudam a personalizar os Serviços. A instalação, permanência e existência dos cookies no computador do Usuário dependerão de sua exclusiva vontade e poderão ser eliminados de seu celular/computador quando o Usuário assim desejar.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        SEÇÃO 08 - Web Beacons
      </h2>
      <p className="mb-4">
      Um Web beacon é uma imagem eletrônica, também chamada single-pixel (1 x 1) ou pixel transparente, que é colocada em código em uma página da internet. Um Web beacon tem finalidades similares aos Cookies. Adicionalmente um Web beacon é utilizado para medir padrões de tráfego dos Usuários de uma página a outra com objetivo de maximizar o fluxo de tráfego através da internet. O Usuário e o visitante do aplicativo/site do SaudeVSA manifesta conhecer e aceitar que o SaudeVSA poderá usar um sistema de coleta de dados mediante a utilização de Web beacons.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        SEÇÃO 09 - Spam
      </h2>
      <p className="mb-4">
      O SaudeVSA e os seus usuários não aceitam condutas consideradas &quot; spamming &quot;, seja em opiniões, perguntas, respostas e/ou no envio solicitado de e-mails ou no chat. Fica absolutamente proibido o envio indiscriminado de mensagens de qualquer natureza entre os usuários do SaudeVSA
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        SEÇÃO 10 - Requerimentos Legais
      </h2>
      <p className="mb-4">
      O SaudeVSA coopera com as autoridades competentes e com terceiros para garantir o cumprimento das leis, salvaguardar a integridade e a segurança do aplicativo/site e de seus Usuários, impedir atividades ilegais, por exemplo, em matéria de proteção de direitos de propriedade industrial e intelectual, prevenção a fraudes e outros.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        SEÇÃO 11 - Cancelamento e/ou Retificação dos Dados
      </h2>
      <p className="mb-4">
      O Usuário, ao cadastrar-se, manifesta conhecer e pode exercitar seus direitos de cancelar seu cadastro e acessar e atualizar seus dados pessoais. O Usuário garante e responde pela veracidade, exatidão, vigência e autenticidade dos dados pessoais, e se compromete a mantê-los devidamente atualizados.
Os Usuários devem atualizar seus dados pessoais regularmente.

      </p>
      </div>
      
      <button
        onClick={onClose}
        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
      >
        Fechar
      </button>
    </div>
  </div>
  );
};
 export default PrivacyModal;