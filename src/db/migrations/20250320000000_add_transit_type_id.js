/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
exports.up = function (knex) {
  return knex.schema.table("journal_entries", (table) => {
    table.string("transit_type_id").nullable();
    table.index("transit_type_id");
  });
};

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
exports.down = function (knex) {
  return knex.schema.table("journal_entries", (table) => {
    table.dropColumn("transit_type_id");
  });
};
