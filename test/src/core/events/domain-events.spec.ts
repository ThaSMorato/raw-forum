import { AggregateRoot } from '@/core/entities/aggregate-root'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DomainEvent } from '@/core/events/domain-event'
import { DomainEvents } from '@/core/events/domain-events'

class CustomAggregateCreated implements DomainEvent {
  public ocurredAt: Date
  // eslint-disable-next-line no-use-before-define
  private aggregate: CustomAggregate

  constructor(aggregate: CustomAggregate) {
    this.aggregate = aggregate
    this.ocurredAt = new Date()
  }

  public getAggregateId(): UniqueEntityID {
    return this.aggregate.id
  }
}

class CustomAggregate extends AggregateRoot<null> {
  static create() {
    const aggregate = new CustomAggregate(null)

    aggregate.addDomainEvent(new CustomAggregateCreated(aggregate))

    return aggregate
  }
}

describe('Domain events', () => {
  it('should be able to dispatch and listen to events', () => {
    const callbackSpy = vi.fn()

    // Subscriber cadastrado
    DomainEvents.register(callbackSpy, CustomAggregateCreated.name)

    // Criando uma resposta sem salvar no banco
    const aggregate = CustomAggregate.create()

    // assegurando que o evento foi criado mas nao disparado
    expect(aggregate.domainEvents).toHaveLength(1)
    expect(callbackSpy).not.toHaveBeenCalled()

    // Salvando no banco e disparando o evento
    DomainEvents.dispatchEventsForAggregate(aggregate.id)

    // Subscriber ouve o evento e faz oq precisa ser feito
    expect(aggregate.domainEvents).toHaveLength(0)
    expect(callbackSpy).toHaveBeenCalled()
  })
})
