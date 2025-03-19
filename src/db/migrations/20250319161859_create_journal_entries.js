/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
exports.up = function (knex) {
  return knex.schema.createTable("journal_entries", (table) => {
    table.uuid("id").primary();
    table.uuid("transit_id").notNullable();
    table.text("content").notNullable();
    table.string("mood");
    table.specificType("tags", "text[]");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // Indexes
    table.index("transit_id");
    table.index("tags");
  });
};

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
exports.down = function (knex) {
  return knex.schema.dropTable("journal_entries");
};
