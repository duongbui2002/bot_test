import moment from 'moment';

export const handleGetProjectRes = async (response: any[]) => {

  let result = 'Projects:\n'

  for (const ele of response) {
    result += `ID: ${ele.id}\n projectName: ${ele.name}\n url: ${ele.web_url} \n createdAt: ${moment(ele.created_at).utcOffset('+0700').format('YYYY-MM-DD HH:mm')}\n\n`
  }

  return result

}

export const handlePayloadPushEvent = (payload: any) => {
  let result = ''
  result += `<b>${payload.user_name} has just pushed ${payload.total_commits_count} commits on ${payload.project.name} \n\n</b>`
  result += `Commits:`
  for (const rawCommit of payload.commits) {
    result += handleCommit(rawCommit)
    result += '\n'
  }

  result +=
    `Repository URL: ${payload.project.http_url}\nNamespace: ${payload.project.namespace}\nPush ref: ${payload.ref}
    `
  return result
}


export const handleMergeRequestEvent = (payload: any) => {
  let result = ''
  result += `<b>A merge request has been ${payload.object_attributes.state} by ${payload.user.name} \n\n</b>`
  result += `<pre>Affected branches: <b>${payload.object_attributes.source_branch} </b> is request merged into <b> ${payload.object_attributes.source_branch}</b> with latest commit at ${payload.object_attributes.last_commit.timestamp}\n</pre>`
  result +=
    `\nRepository URL: ${payload.project.http_url}\nNamespace: ${payload.project.namespace}
    `
  return result
}


export function handleCommit(rawCommit: any) {
  let result = ''
  result +=
    `<pre>Commit by ${rawCommit.author.name}
URL:${rawCommit.url}
Title: ${rawCommit.title}
    (+) ${rawCommit.added.length} files added.
    (~) ${rawCommit.modified.length} files modified.
    (-) ${rawCommit.removed.length} files removed.
Commit was created at ${moment(rawCommit.timestamp).utcOffset('+0700').format('YYYY-MM-DD HH:mm')}
     </pre>`
  return result
}

export function handleLastCommitInMergeRequest(rawCommit: any) {
  let result = ''
  result +=
    `<pre>Commit by ${rawCommit.author.name} 
Email: ${rawCommit.author.email}
URL:${rawCommit.url}
Title: ${rawCommit.message}
Commit was created at ${moment(rawCommit.timestamp).utcOffset('+0700').format('YYYY-MM-DD HH:mm')}
     </pre>`
  return result
}


export const handleUserResponse = (payload: any[]) => {
  let result = '<b>Users:\n</b>'

  for (const ele of payload) {
    result += `<b>TelegramID</b>: ${ele.telegramId}\n <b>Name</b>: ${ele.name}\n <b>Role</b>: ${ele.role} \n\n`
  }

  return result
}

export const handlePipelineEvent = (payload: any) => {

  let result = ''
  result += `<b>A pipeline has been activated by ${payload.user.name}:</b><pre>    Project: ${payload.project.name}
    Source: ${payload.object_attributes.source}
    Status: ${payload.object_attributes.status}
    Created at: ${moment(payload.object_attributes.created_at).utcOffset('+0700').format('YYYY-MM-DD HH:mm')}
    Commit by ${payload.commit.author.name}:
        (+) URL: ${payload.commit.url}
        (+) Title: ${payload.commit.title}
        (+) Created at ${moment(payload.commit.timestamp).utcOffset('+0700').format('YYYY-MM-DD HH:mm')}
     </pre>`

  result += `\nRepository URL: ${payload.project.web_url}\nNamespace: ${payload.project.namespace}
    `
  return result
}
