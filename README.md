# mongo-migrations-ts

A simple migration system for MongoDB supporting string version migrations.

## Installation

Migrations can be installed through npm package manager. Type:

``` sh
    $ npm -i -S mongo-migrations-ts
```
### Setup
Migrations require two raw mongodb collection to get started. Please create two collection in your database and provide that at the beginning of our application.
```javascript
  import Migrations from 'mongo-migrations-ts';
  Migrations.config(MigrationStatusRawCollection, MigrationListCollection);
```

### Additional Configuration

You can configure Migrations with the `config` method. Defaults are:

``` javascript
    Migrations.config(MigrationStatusRawCollection, MigrationListCollection, {
        stopIfOldVersionScriptAdded: true,
        // stop if old version script updated
        stopIfOldVersionScriptUpdated: true,
        // migrations collection name
    });
```

## API

### Basics

To write a simple migration, somewhere in the server section of your project define:

``` javascript
    import Migrations from 'mongo-migrations-ts';
    Migrations.add({
        version: '1.0.0_1',
        name: 'Migration Script 1.0.0_1',
        run: async function() {//code to migrate to version 1.0.0_1}
    });
```

To run this migration from within your app call, please be advice migrateTo function is an asynchronus call:

``` javascript

      await Migrations.migrateTo('latest');

```

### Advanced

A more complete set of migrations might look like:

``` javascript
    Migrations.add({
        version: '1.0.0_1',
        name: 'Migration Script 1.0.0_1',
        run: async function() {
            //code to migrate to version 1.0.0_1
        }
    });
    Migrations.add({
        version: '1.0.0_2',
        name: 'Migration Script 1.0.0_2',
        run: async function() {
            //code to migrate to version 1.0.0_2
        }
    });
```

As in 'Basics', you can migrate to the latest by running:

``` javascript
        Migrations.migrateTo('latest');
```

By specifying a version, you can run individual migrating script. The migrations system will simply execute the script.  

In the above example, you could migrate directly to version 1.0.0_2 by running:

``` javascript
    Migrations.migrateTo('1.0.0_2');
```

 Note: If you are in migration locked state, it will execute the script but it will not change the locked state. For that, you will be able to unlock migration with simple command.

``` javascript
    Migrations.migrateTo('1.0.0_2');
    Migrations.unlock();
```
    
To see what version are executed, call:

``` javascript
    Migrations.getExecutedVersions();
```

### Migrating from other migration package
If you are migrating from other migration package and wish to skip few of the script from running use following:
```javascript
    // Adds '2.2.0_1' and '2.2.0_2' to database without running.
    ['2.2.0_1', '2.2.0_2'].forEach(version => {
        Migrations.saveMigrationWithoutRunning(version);
    });
    // Runs migration scripts after '2.2.0_2'.
    Migrations.migrateTo('latest');
```

## Contributing

1. Write some code.
2. Write some tests.

## License
MIT License