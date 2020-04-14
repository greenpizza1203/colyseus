@file:Suppress("INTERFACE_WITH_SUPERCLASS", "OVERRIDING_FINAL_MEMBER", "RETURN_TYPE_MISMATCH_ON_OVERRIDE", "CONFLICTING_OVERLOADS", "EXTERNAL_DELEGATION")

import kotlin.js.*
import kotlin.js.Json
import org.khronos.webgl.*
import org.w3c.dom.*
import org.w3c.dom.events.*
import org.w3c.dom.parsing.*
import org.w3c.dom.svg.*
import org.w3c.dom.url.*
import org.w3c.fetch.*
import org.w3c.files.*
import org.w3c.notifications.*
import org.w3c.performance.*
import org.w3c.workers.*
import org.w3c.xhr.*

external var REMOTE_ROOM_SHORT_TIMEOUT: Number

external fun generateId(): Any

external fun registerGracefulShutdown(callback: (err: Error) -> Unit)

external fun <T> retry(cb: Function<*>, maxRetries: Number = definedExternally, errorWhiteList: Array<Any> = definedExternally, retries: Number = definedExternally): Promise<T>

external open class Deferred<T> {
    open var promise: Promise<T>
    open var resolve: Function<*>
    open var reject: Function<*>
    open fun then(func: (value: T) -> Any): Any
    open fun catch(func: (value: Any) -> Any): Promise<Any>
}

external fun spliceOne(arr: Array<Any>, index: Number): Boolean

external fun merge(a: Any, vararg objs: Any): Any