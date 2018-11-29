exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('user_preferences', function(table) {
            table.increments('user_preferences_id').primary();
            table.integer('telegram_user_id');
            table.integer('home_station_id');
            table.integer('work_station_id');
            table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
            table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
        }),
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('user_preferences'),
    ])

};
