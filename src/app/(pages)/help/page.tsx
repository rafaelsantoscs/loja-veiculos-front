import React from "react";
import Link from "next/link";

const HelpPage: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-blue-800 via-blue-600 to-emerald-400 dark:from-blue-900 dark:via-blue-800 dark:to-emerald-700 flex items-center justify-center p-4">
    <div className="w-full max-w-2xl mx-auto bg-white/80 dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
      <h1 className="text-3xl font-bold text-blue-900 dark:text-white text-center mb-6">Ajuda & Suporte</h1>
      <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 text-center">Bem-vindo à página de ajuda do Sistema de Vigilância Sanitária.</p>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-2">Como obter acesso ao sistema?</h2>
          <ol className="list-decimal list-inside text-slate-700 dark:text-slate-300 space-y-2">
            <li>
              Acesse a <Link href="/register" className="text-blue-600 dark:text-blue-400 underline">página de cadastro</Link> e preencha seus dados pessoais, criando sua própria conta de acesso.
            </li>
            <li>Confirme seu e-mail e siga as instruções para ativar sua conta.</li>
            <li>Após o cadastro, faça login com seu usuário e senha escolhidos.</li>
            <li>No primeiro acesso, revise seus dados e personalize seu perfil se desejar.</li>
            <li>Em caso de dúvidas ou problemas, entre em contato com o suporte abaixo.</li>
          </ol>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-2">Recuperação de senha</h2>
          <p>Se você esqueceu sua senha, utilize o link <Link href="/forgot-password" className="text-blue-600 dark:text-blue-400 underline">Esqueceu a senha?</Link> na tela de login e siga as instruções para redefinir sua senha por e-mail.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-2">Dúvidas frequentes</h2>
          <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
            <li>Não recebi o e-mail de cadastro: Verifique sua caixa de spam ou entre em contato com o suporte.</li>
            <li>Não consigo acessar: Confirme se o usuário e senha estão corretos e se seu cadastro está ativo.</li>
            <li>Problemas com permissões: Solicite ao administrador do sistema a revisão do seu perfil de acesso.</li>
            <li>Notificações não chegam: Certifique-se de que as permissões de notificação estão habilitadas no seu navegador.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-2">Contato para suporte</h2>
          <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/40 dark:to-green-900/40 p-8 rounded-2xl shadow-lg mt-4">
            <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-6 text-center">Contato para suporte</h3>
            <div className="flex flex-col gap-6 items-center justify-center">
              <div className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl shadow p-4 w-full max-w-md">
                <span className="text-3xl text-red-500 dark:text-red-400">📞</span>
                <div>
                  <span className="block font-semibold text-slate-800 dark:text-white">Telefone</span>
                  <span className="block text-slate-600 dark:text-slate-300">(81) 3526 - 5333</span>
                  <span className="block text-sm text-slate-500">Seg-Sex: 7h às 16h</span>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl shadow p-4 w-full max-w-md">
                <span className="text-3xl text-blue-600 dark:text-blue-400">📧</span>
                <div>
                  <span className="block font-semibold text-slate-800 dark:text-white">E-mail</span>
                  <span className="block text-slate-600 dark:text-slate-300">sms.vitoria.visa@gmail.com</span>
                  <span className="block text-sm text-slate-500">Resposta em até 48h</span>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl shadow p-4 w-full max-w-md">
                <span className="text-3xl text-orange-500 dark:text-orange-400">📍</span>
                <div>
                  <span className="block font-semibold text-slate-800 dark:text-white">Presencial</span>
                  <span className="block text-slate-600 dark:text-slate-300">Sede da VISA</span>
                  <span className="block text-sm text-slate-500">Av. Henrique Holanda, 727 - Matriz - Vitória de Santo Antão - PE</span>
                  <span className="block text-sm text-slate-500">Atendimento por ordem de chegada</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="mt-8 text-center">
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold">Voltar à página inicial</Link>
      </div>
      <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 text-center">© 2025 Vigilância Sanitária. Todos os direitos reservados.</p>
    </div>
  </div>
);

export default HelpPage;
