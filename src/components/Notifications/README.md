# NotificationModal Component

Um componente reutilizável para exibir notificações pendentes em qualquer tela da aplicação.

## Funcionalidades

- ✅ Verifica automaticamente notificações pendentes
- ✅ Modal responsivo com formatação de data corrigida
- ✅ Marca notificações como recebidas automaticamente ao fechar
- ✅ Callbacks para integração com componentes pai
- ✅ Suporte a dark mode
- ✅ Toast notifications para feedback

## Como Usar

### Uso Básico (Automático)
```tsx
import NotificationModal from "../Notifications/NotificationModal";

const MeuComponente: React.FC = () => {
  return (
    <>
      {/* Verificará automaticamente as notificações */}
      <NotificationModal autoFetch={true} />
      
      {/* Seu conteúdo aqui */}
      <div>...</div>
    </>
  );
};
```

### Uso com Callbacks
```tsx
import NotificationModal from "../Notifications/NotificationModal";

const MeuComponente: React.FC = () => {
  const handleNotificationsFound = (count: number) => {
    console.log(`${count} notificações encontradas`);
  };

  const handleNotificationsCleared = () => {
    console.log("Todas as notificações foram marcadas como recebidas");
  };

  return (
    <>
      <NotificationModal 
        autoFetch={true}
        onNotificationsFound={handleNotificationsFound}
        onNotificationsCleared={handleNotificationsCleared}
      />
      
      <div>...</div>
    </>
  );
};
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `autoFetch` | `boolean` | `true` | Se deve verificar automaticamente as notificações ao montar |
| `onNotificationsFound` | `(count: number) => void` | `undefined` | Callback chamado quando há notificações pendentes |
| `onNotificationsCleared` | `() => void` | `undefined` | Callback chamado quando todas as notificações são marcadas como recebidas |

## Telas que já utilizam

1. **Dashboard (E-commerce.tsx)** - Exibe notificações ao acessar o dashboard
2. **FormMapaDoVeiculo.tsx** - Exibe notificações ao abrir o mapa de veículo
3. **FrotaPainel.tsx** - Exibe notificações no painel da frota

## Como Adicionar em Nova Tela

1. Importe o componente:
```tsx
import NotificationModal from "../Notifications/NotificationModal";
```

2. Adicione no JSX (geralmente no início do return):
```tsx
return (
  <>
    <NotificationModal autoFetch={true} />
    {/* resto do seu componente */}
  </>
);
```

## Comportamento

- O componente busca notificações pendentes automaticamente quando `autoFetch={true}`
- Exibe um modal com todas as notificações pendentes para o usuário logado
- Quando o usuário clica "OK", todas as notificações são marcadas como recebidas
- As datas são formatadas corretamente no padrão brasileiro (dd/MM/yyyy HH:mm)
- O modal possui z-index alto (z-50) para aparecer sobre outros elementos

## Personalização

O componente utiliza classes do Tailwind CSS e suporta dark mode automaticamente. As cores e estilos podem ser personalizados modificando as classes CSS no arquivo `NotificationModal.tsx`.
