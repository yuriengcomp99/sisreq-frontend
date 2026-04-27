import { EditarRequisicaoClient } from "./editar-requisicao-client"

export default async function EditarRequisicaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditarRequisicaoClient requisicaoId={id} />
}
