import {Injectable, EventEmitter} from "@angular/core";

import { Couchbase } from "nativescript-couchbase";

// let database = new Couchbase("QuestionInkarri/test-database");
@Injectable()
export class DatabaseService {

    private database: any;
    private pushReplicator: any;
    private pullReplicator: any;
    private listener: EventEmitter<any> = new EventEmitter();

    public constructor() {
        this.database = new Couchbase("movie-db");
        this.database.createView("movies", "1", function(document, emitter) {
            if(document.type == "movie") {
                emitter.emit(document._id, document);
            }
        });
    }

    public query(viewName: string): Array<any> {
        return this.database.executeQuery(viewName);
    }

    public startReplication(gateway: string, bucket: string) {
        this.pushReplicator = this.database.createPushReplication("http://" + gateway + ":4984/" + bucket);
        this.pullReplicator = this.database.createPullReplication("http://" + gateway + ":4984/" + bucket);
        this.pushReplicator.setContinuous(true);
        this.pullReplicator.setContinuous(true);
        this.database.addDatabaseChangeListener(changes => {
            this.listener.emit(changes);
        });
        this.pushReplicator.start();
        this.pullReplicator.start();
    }

    public getDatabase() {
        return this.database;
    }

    public getChangeListener() {
        return this.listener;
    }

}