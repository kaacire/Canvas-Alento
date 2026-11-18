# Arquitetura base — mapa conceito → código

> Sugestão inicial. O conceito (seção 31) mantém arquitetura, banco, hospedagem,
> autenticação e armazenamento **em aberto**.

| Conceito (seção) | Onde está na base |
| --- | --- |
| 3. Categorias (4) | `packages/shared/src/categories.ts` |
| 4. Templates (plataforma / comunidade) | `Template` + `apps/api/src/modules/templates` |
| 5. Cópias independentes | `Experience.content` (cópia do JSON do template) |
| 6. Personalização controlada | `TemplateStructure.editableSlots` (shared) |
| 7. Temas (4) | `shared/themes.ts` + `apps/web/src/styles/themes/*.css` |
| 8. Minigames reutilizáveis | `Minigame`, `ExperienceMinigame` + módulo `minigames` |
| 10. Biblioteca pessoal | módulos `experiences`, `minigames`, `media` |
| 11–12. Compartilhamento e privacidade | `Experience.visibility` / `accessMode` + módulo `sharing` |
| 13. Progresso automático | `ParticipantProgress` + `sharing` (`/progress`) |
| 14. Respostas pertencem ao participante | **sem** endpoint de respostas para o criador (de propósito) |
| 15. Edição colaborativa | `ExperienceCollaborator` + módulo `collaboration` |
| 16–17. Galeria, feed, curtir/favoritar/seguir | `Like`, `Favorite`, `Follow` + módulo `community` |
| 18–19. Templates pagos e licença | `Template.priceCents`, `TemplateLicense` |
| 20–21. Assinatura Free/Premium | `Subscription` + `shared/plans.ts` |
| 22–27. Arquivos, biblioteca, exclusão inteligente | `MediaFile` + `MediaUsage` (contagem de referências) |

## Regras que o schema já protege

- Template original nunca é alterado: o usuário trabalha em `Experience.content` (cópia).
- Arquivo ≠ uso: `MediaFile` guarda o arquivo uma vez; `MediaUsage` liga a experiências/templates.
- Exclusão inteligente: remover da biblioteca só marca `inLibrary = false`; o arquivo é apagado
  do storage quando não houver mais `MediaUsage`.
- Experiências nascem `PRIVATE`.
- Sem limite de quantidade de experiências por plano.

## Ainda não decidido (não implementar sem definição)

Nome e identidade visual, nomes/estrutura dos 12 templates, regras dos minigames, moderação,
preços/comissão/pagamentos/reembolso, limites e formatos de arquivo, permissões colaborativas
detalhadas, atualização e transferência de propriedade, política de conteúdo e direitos autorais.
