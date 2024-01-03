import { randomUUID } from "node:crypto"

interface QuestionProps {
  title: string,
  content: string
  authorId: string
}

export class Question {
  public id: string
  public title: string
  public content: string
  public authorId: string

  constructor( {authorId, content, title}: QuestionProps, id?: string) {
    this.title = title
    this.content = content
    this.authorId = authorId

    this.id = id ?? randomUUID()
  }
}
