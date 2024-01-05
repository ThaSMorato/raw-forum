import { WatchedList } from '@/core/entities/watched-list'

class NumberWatchList extends WatchedList<number> {
  compareItems(a: number, b: number): boolean {
    return a === b
  }
}

describe('watched list', () => {
  it('should be able to create a watcehd list with initial items', () => {
    const list = new NumberWatchList([1, 2, 3])

    expect(list.getItems()).toStrictEqual([1, 2, 3])
    expect(list.currentItems).toHaveLength(3)
  })

  it('should be able to add new items to the list', () => {
    const list = new NumberWatchList([1, 2, 3])

    list.add(4)

    expect(list.currentItems).toHaveLength(4)
    expect(list.getNewItems()).toEqual([4])
    expect(list.getItems()).toStrictEqual([1, 2, 3, 4])
  })

  it('should be able to remove items to the list', () => {
    const list = new NumberWatchList([1, 2, 3])

    list.remove(2)

    expect(list.currentItems).toHaveLength(2)
    expect(list.getRemovedItems()).toEqual([2])
    expect(list.getItems()).toStrictEqual([1, 3])
  })

  it('should be able to add an item even if it was removed before', () => {
    const list = new NumberWatchList([1, 2, 3])

    list.remove(2)
    list.add(2)

    expect(list.currentItems).toHaveLength(3)
    expect(list.getRemovedItems()).toEqual([])
    expect(list.getNewItems()).toEqual([])
    expect(list.getItems()).toStrictEqual([1, 3, 2])
  })

  it('should be able to delete an item even if it was added before', () => {
    const list = new NumberWatchList([1, 2, 3])

    list.add(4)
    list.remove(4)

    expect(list.currentItems).toHaveLength(3)
    expect(list.getRemovedItems()).toEqual([])
    expect(list.getNewItems()).toEqual([])
    expect(list.getItems()).toStrictEqual([1, 2, 3])
  })

  it('should be able to update watched list items', () => {
    const list = new NumberWatchList([1, 2, 3])

    list.update([1, 3, 5])

    expect(list.currentItems).toHaveLength(3)
    expect(list.getRemovedItems()).toEqual([2])
    expect(list.getNewItems()).toEqual([5])
    expect(list.getItems()).toStrictEqual([1, 3, 5])
  })
})
