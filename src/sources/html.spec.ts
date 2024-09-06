/**
 * Copyright (c) 2024 The Diffusion Studio Authors
 *
 * This Source Code Form is subject to the terms of the Mozilla 
 * Public License, v. 2.0 that can be found in the LICENSE file.
 */

import { describe, expect, it, vi } from 'vitest';
import { HtmlSource } from './html';

describe('The Html Source Object', () => {
	it('should initialize from a file using the static method', async () => {
		const file = new File([], 'test.html', { type: 'text/html' });
		const source = await HtmlSource.from(file);

		expect(source.name).toBe('test.html');
		expect(source.mimeType).toBe('text/html');
		expect(source.external).toBe(false);
		expect(source.file).toBeInstanceOf(File);
		expect(source).toBeInstanceOf(HtmlSource);
	});

	it('should create an object url when the iframe loads', async () => {
		const file = new File([], 'test.html', { type: 'text/html' });
		const source = await HtmlSource.from(file);

		const evtMock = mockIframeValid(source);
		mockDocumentValid(source);

		const url = await source.createObjectURL();
		expect(url).toBe("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E");
		expect(evtMock).toHaveBeenCalledTimes(1);

		await source.createObjectURL();

		expect(evtMock).toHaveBeenCalledTimes(1);
	});

	it('should not create an object url when the iframe throws an error', async () => {
		const file = new File([], 'test.html', { type: 'text/html' });
		const source = await HtmlSource.from(file);

		const evtMock = mockIframeInvalid(source);
		mockDocumentValid(source);

		await expect(() => source.createObjectURL()).rejects.toThrowError();
		expect(evtMock).toHaveBeenCalledTimes(1);
	});
});

function mockIframeValid(source: HtmlSource) {
	return vi.spyOn(source.iframe, 'onload', 'set')
		.mockImplementation(function (this: HTMLMediaElement, fn) {
			fn?.call(this, new Event('load'));
		});
}

function mockIframeInvalid(source: HtmlSource) {
	return vi.spyOn(source.iframe, 'onerror', 'set')
		.mockImplementation(function (this: HTMLMediaElement, fn) {
			fn?.call(this, new Event('error'));
		});
}

function mockDocumentValid(source: HtmlSource) {
	return vi.spyOn(source, 'document', 'get')
		.mockReturnValue({
			body: {
				scrollWidth: 200,
				scrollHeight: 400,
			},
			cloneNode: () => ({
				getElementsByTagName: () => ({
					item: () => undefined
				})
			})
		} as any);
}