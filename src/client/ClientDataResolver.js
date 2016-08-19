const getStructure = name => require(`../structures/${name}`);

const User = getStructure('User');
const Message = getStructure('Message');
const Guild = getStructure('Guild');
const Channel = getStructure('Channel');
const GuildMember = getStructure('GuildMember');

function $string(obj) {
  return (typeof obj === 'string' || obj instanceof String);
}

/**
 * The DataResolver identifies different objects and tries to resolve a specific piece of information from them, e.g.
 * extracting a User from a Message object.
 * @private
 */
class ClientDataResolver {

  constructor(client) {
    this.client = client;
  }
  /**
   * Data that resolves to give a User object. This can be:
   * * A User object
   * * A User ID
   * * A Message (resolves to the message author)
   * * A Guild (owner of the guild)
   * @typedef {User|String|Message|Guild} UserResolvable
   */

  /**
   * Resolves a UserResolvable to a User object
   * @param {UserResolvable} user the UserResolvable to identify
   * @returns {?User}
   */
  resolveUser(user) {
    if (user instanceof User) {
      return user;
    } else if ($string(user)) {
      return this.client.store.get('users', user);
    } else if (user instanceof Message) {
      return user.author;
    } else if (user instanceof Guild) {
      return user.owner;
    }

    return null;
  }

  /**
   * Data that resolves to give a Guild object. This can be:
   * * A Guild object
   * @typedef {Guild} GuildResolvable
   */

  /**
   * Resolves a GuildResolvable to a Guild object
   * @param {GuildResolvable} guild the GuildResolvable to identify
   * @returns {?Guild}
   */
  resolveGuild(guild) {
    if (guild instanceof Guild) {
      return guild;
    }
    return null;
  }

  /**
   * Data that resolves to give a GuildMember object. This can be:
   * * A GuildMember object
   * * A User object
   * @typedef {Guild} GuildMemberResolvable
   */
  /**
   * Resolves a GuildMemberResolvable to a GuildMember object
   * @param {GuildResolvable} guild the guild that the member is part of
   * @param {UserResolvable} user the user that is part of the guild
   * @returns {?GuildMember}
   */
  resolveGuildMember($guild, $user) {
    let guild = $guild;
    let user = $user;
    if (user instanceof GuildMember) {
      return user;
    }

    guild = this.resolveGuild(guild);
    user = this.resolveUser(user);

    if (!guild || !user) {
      return null;
    }

    return guild.store.get('members', user.id);
  }

  /**
   * Data that resolves to give a Base64 string, typically for image uploading. This can be:
   * * A Buffer
   * * A Base64 String
   * @typedef {Buffer|String} Base64Resolvable
   */

  /**
   * Resolves a Base64Resolvable to a Base 64 image
   * @param {Base64Resolvable} dataResolvable the base 64 resolvable you want to resolve
   * @returns {?String}
   */
  resolveBase64(data) {
    if (data instanceof Buffer) {
      return `data:image/jpg;base64,${data.toString('base64')}`;
    }

    return data;
  }

  /**
   * Data that can be resolved to give a Channel. This can be:
   * * An instance of a Channel
   * * An ID of a Channel
   * @typedef {Channel|String} ChannelResolvable
   */

  /**
   * Resolves a ChannelResolvable to a Channel object
   * @param {ChannelResolvable} channelResolvable the channel resolvable to resolve
   * @returns {?Channel}
   */
  resolveChannel(channel) {
    if (channel instanceof Channel) {
      return channel;
    }

    if ($string(channel)) {
      return this.client.store.get('channels', channel);
    }

    return null;
  }

  /**
   * Data that can be resolved to give a String. This can be:
   * * A String
   * * An Array (joined with a new line delimiter to give a string)
   * * Any object
   * @typedef {String|Array|Object} StringResolvable
   */

  /**
   * Resolves a StringResolvable to a String
   * @param {StringResolvable} stringResolvable the string resolvable to resolve
   * @returns {String}
   */
  resolveString(data) {
    if (data instanceof String) {
      return data;
    }

    if (data instanceof Array) {
      return data.join('\n');
    }

    return String(data);
  }
}

module.exports = ClientDataResolver;
