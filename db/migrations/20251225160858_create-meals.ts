import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.uuid('user_id').references('users.id').notNullable()
    table.string('name').notNullable()
    table.text('description').notNullable()
    table.datetime('date').notNullable()
    table.boolean('is_in_diet').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
