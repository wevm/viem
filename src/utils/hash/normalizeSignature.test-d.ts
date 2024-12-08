import { expectTypeOf, test } from 'vitest'
import { normalizeSignature } from './normalizeSignature.js'

/**
 * Cases where we should be able to get proper types for this, but where the feature just isn't implemented in Viem
 */
type TodoType = string

test('foo()', () => {
  expectTypeOf(normalizeSignature('event foo()')).toMatchTypeOf<'foo()'>()
})

test('bar(uint foo)', () => {
  expectTypeOf(normalizeSignature('bar(uint foo)')).toMatchTypeOf<TodoType>()
})

test('processAccount(uint256 , address )', () => {
  expectTypeOf(
    normalizeSignature('processAccount(uint256 , address )'),
  ).toMatchTypeOf<TodoType>()
})

test('function bar()', () => {
  expectTypeOf(normalizeSignature('function bar()')).toMatchTypeOf<'bar()'>()
})

test('function bar()', () => {
  expectTypeOf(normalizeSignature('function  bar( )')).toMatchTypeOf<TodoType>()
})

test('event Bar()', () => {
  expectTypeOf(normalizeSignature('event Bar()')).toMatchTypeOf<'Bar()'>()
})

test('function bar(uint foo)', () => {
  expectTypeOf(
    normalizeSignature('function bar(uint foo)'),
  ).toMatchTypeOf<'bar(uint256)'>()
})

test('function bar(uint foo, address baz)', () => {
  expectTypeOf(
    normalizeSignature('function bar(uint foo, address baz)'),
  ).toMatchTypeOf<'bar(uint256,address)'>()
})

test('event Barry(uint foo)', () => {
  expectTypeOf(
    normalizeSignature('event Barry(uint foo)'),
  ).toMatchTypeOf<'Barry(uint256)'>()
})

test('Barry(uint indexed foo)', () => {
  expectTypeOf(
    normalizeSignature('Barry(uint indexed foo)'),
  ).toMatchTypeOf<TodoType>()
})

test('event Barry(uint indexed foo)', () => {
  expectTypeOf(
    normalizeSignature('event Barry(uint indexed foo)'),
  ).toMatchTypeOf<'Barry(uint256)'>()
})

test('function _compound(uint256 a, uint256 b, uint256 c)', () => {
  expectTypeOf(
    normalizeSignature('function _compound(uint256 a, uint256 b, uint256 c)'),
  ).toMatchTypeOf<'_compound(uint256,uint256,uint256)'>()
})

test('bar(uint foo, (uint baz))', () => {
  expectTypeOf(
    normalizeSignature('bar(uint foo, (uint baz))'),
  ).toMatchTypeOf<TodoType>()
})

test('bar(uint foo, (uint baz, bool x))', () => {
  expectTypeOf(
    normalizeSignature('bar(uint foo, (uint baz, bool x))'),
  ).toMatchTypeOf<TodoType>()
})

test('bar(uint foo, (uint baz, bool x) foo)', () => {
  expectTypeOf(
    normalizeSignature('bar(uint foo, (uint baz, bool x) foo)'),
  ).toMatchTypeOf<TodoType>()
})

test('bar(uint[] foo, (uint baz, bool x))', () => {
  expectTypeOf(
    normalizeSignature('bar(uint[] foo, (uint baz, bool x))'),
  ).toMatchTypeOf<TodoType>()
})

test('bar(uint[] foo, (uint baz, bool x)[])', () => {
  expectTypeOf(
    normalizeSignature('bar(uint[] foo, (uint baz, bool x)[])'),
  ).toMatchTypeOf<TodoType>()
})

test('foo(uint bar)', () => {
  expectTypeOf(
    normalizeSignature('foo(uint bar) payable returns (uint)'),
  ).toMatchTypeOf<TodoType>()
})

test('function submitBlocksWithCallbacks(bool isDataCompressed, bytes calldata data, ((uint16,(uint16,uint16,uint16,bytes)[])[], address[])  calldata config)', () => {
  expectTypeOf(
    normalizeSignature(
      'function submitBlocksWithCallbacks(bool isDataCompressed, bytes calldata data, ((uint16,(uint16,uint16,uint16,bytes)[])[], address[])  calldata config)',
    ),
  ).toMatchTypeOf<'submitBlocksWithCallbacks(bool,bytes,((uint16,(uint16,uint16,uint16,bytes)[])[],address[]))'>(
    'submitBlocksWithCallbacks(bool,bytes,((uint16,(uint16,uint16,uint16,bytes)[])[],address[]))',
  )
})

test('function createEdition(string name, string symbol, uint64 editionSize, uint16 royaltyBPS, address fundsRecipient, address defaultAdmin, (uint104 publicSalePrice, uint32 maxSalePurchasePerAddress, uint64 publicSaleStart, uint64 publicSaleEnd, uint64 presaleStart, uint64 presaleEnd, bytes32 presaleMerkleRoot) saleConfig, string description, string animationURI, string imageURI) returns (address)', () => {
  expectTypeOf(
    normalizeSignature(
      'function createEdition(string name, string symbol, uint64 editionSize, uint16 royaltyBPS, address fundsRecipient, address defaultAdmin, (uint104 publicSalePrice, uint32 maxSalePurchasePerAddress, uint64 publicSaleStart, uint64 publicSaleEnd, uint64 presaleStart, uint64 presaleEnd, bytes32 presaleMerkleRoot) saleConfig, string description, string animationURI, string imageURI) returns (address)',
    ),
  ).toMatchTypeOf<'createEdition(string,string,uint64,uint16,address,address,(uint104,uint32,uint64,uint64,uint64,uint64,bytes32),string,string,string)'>()
})

test('trim spaces', () => {
  expectTypeOf(
    normalizeSignature(
      'function  createEdition(string  name,string symbol,   uint64 editionSize  , uint16   royaltyBPS,     address     fundsRecipient,   address    defaultAdmin, ( uint104   publicSalePrice  ,   uint32 maxSalePurchasePerAddress, uint64 publicSaleStart,   uint64 publicSaleEnd, uint64 presaleStart, uint64 presaleEnd, bytes32 presaleMerkleRoot) saleConfig , string description, string animationURI, string imageURI ) returns (address)',
    ),
  ).toMatchTypeOf<TodoType>()
})

test('error: invalid signatures', () => {
  // TODO: these should be errors, but they aren't yet
  // assertType<never>(normalizeSignature('bar'))
  // assertType<never>(normalizeSignature('bar(uint foo'))
  // assertType<never>(normalizeSignature('baruint foo)'))
  // assertType<never>(normalizeSignature('bar(uint foo, (uint baz)'))
})
